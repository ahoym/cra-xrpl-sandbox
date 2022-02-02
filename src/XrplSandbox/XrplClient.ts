import {
  Client,
  ClientOptions,
  NFTokenAcceptOffer,
  NFTokenBurn,
  NFTokenCancelOffer,
  NFTokenCreateOffer,
  NFTokenCreateOfferFlags,
  NFTokenMint,
  NFTokenMintFlags,
  TxResponse,
  Wallet,
  xrpToDrops,
} from 'xrpl';
import { Amount } from 'xrpl/dist/npm/models/common';
import { MS_IN_S, RIPPLE_EPOCH_IN_MS } from './constants';
import { acceptNftBuyOffer } from './NFTokens/nftClient';

export class XrplClient {
  #client: Client;
  #wallet: Wallet | null;

  constructor(server: string, options?: ClientOptions) {
    this.#client = new Client(server, options);
    this.#wallet = null;
    this.connect();
  }

  public client = () => this.#client;
  public wallet = () => this.#wallet;

  private stateRefProvider = async () => {
    const wallet = await this.connectAndGetWallet();
    return { client: this.#client, wallet };
  };

  private connect = (): Promise<void> => {
    if (this.#client.isConnected()) {
      return Promise.resolve();
    }
    return this.#client.connect();
  };

  public connectAndGetWallet = async (): Promise<Wallet> => {
    await this.connect();

    if (this.#wallet) {
      return Promise.resolve(this.#wallet);
    }
    return this.generateWallet();
  };

  public generateWallet = async (fromSeed?: string): Promise<Wallet> => {
    await this.connect();

    if (fromSeed) {
      this.#wallet = Wallet.fromSeed(fromSeed);
    } else {
      // Instantiate a wallet, only for test and devnets. Currently doesn't seem to work for NFT-Devnet.
      const fundResult = await this.#client.fundWallet();
      this.#wallet = fundResult.wallet;
    }

    return this.#wallet;
  };

  public sendPayment = async (
    xrpAmount: number,
    destinationAddress: string
  ): Promise<TxResponse> => {
    const wallet = await this.connectAndGetWallet();
    const preparedPayment = await this.#client.autofill({
      TransactionType: 'Payment',
      Account: wallet.address,
      Amount: xrpToDrops(xrpAmount),
      Destination: destinationAddress,
    });
    const signed = wallet.sign(preparedPayment);

    return this.#client.submitAndWait(signed.tx_blob);
  };

  /**
   * Specifically mint a transferable NFT
   * {@link https://xrpl.org/nftokenmint.html}
   */
  public mintTransferableNft = async ({
    transferFee,
    URI,
  }: {
    transferFee?: number;
    URI?: string;
  } = {}): Promise<TxResponse> => {
    const wallet = await this.connectAndGetWallet();
    const nfTokenMintTxPayload: NFTokenMint = {
      TransactionType: 'NFTokenMint',
      Account: wallet.address,
      Flags: NFTokenMintFlags.tfTransferable,
      TokenTaxon: 0, // [To-Clarify] What is the practical use case of the TokenTaxon?
      /**
       * Issuer field also requires the AccountRoot to have the `MintAccount` field set to wallet.address.
       * This can be set through the {@link https://xrpl.org/accountset.html} AccountSet Tx.
       */
      // Issuer:     // [To-Clarify] What is the practical use case of having an Issuer account?
    };

    if (URI) {
      nfTokenMintTxPayload.URI = URI;
    }
    // Throw an error instead if desired. See NFTokenMint transaction in jsdoc to see TransferFee constraints.
    const isValidTransferFee =
      !!transferFee && transferFee >= 0 && transferFee <= 9999;
    if (isValidTransferFee) {
      nfTokenMintTxPayload.TransferFee = transferFee;
    }

    return this.#client.submitAndWait(nfTokenMintTxPayload, { wallet });
  };

  public viewOwnNfts = async () => {
    const wallet = await this.connectAndGetWallet();

    return this.#client.request({
      command: 'account_nfts',
      account: wallet.address,
    });
  };

  /**
   * {@link https://xrpl.org/nftokenburn.html}
   */
  public burnNft = async (tokenId: string): Promise<TxResponse> => {
    const wallet = await this.connectAndGetWallet();
    const burnNftTxPayload: NFTokenBurn = {
      TransactionType: 'NFTokenBurn',
      Account: wallet.address,
      TokenID: tokenId,
    };

    return this.#client.submitAndWait(burnNftTxPayload, { wallet });
  };

  /**
   * Note that this transaction type is used for both BUY and SELLs.
   * The differentiators are the various properties of the payload.
   *
   * SELL requires:
   * - Flag.tfSellToken to be set
   *
   * {@link https://xrpl.org/nftokencreateoffer.html}
   */
  public createNftSellOffer = async ({
    amount,
    tokenId,
    destination,
    expirationISOString,
  }: {
    amount: Amount | number;
    tokenId: string;
    destination?: string;
    expirationISOString?: string;
  }): Promise<TxResponse> => {
    const wallet = await this.connectAndGetWallet();
    const nfTokenCreateSellOfferPayload: NFTokenCreateOffer = {
      TransactionType: 'NFTokenCreateOffer',
      Account: wallet.address,
      Amount: typeof amount === 'number' ? xrpToDrops(amount) : amount,
      TokenID: tokenId,
      Flags: NFTokenCreateOfferFlags.tfSellToken,
    };

    if (destination) {
      nfTokenCreateSellOfferPayload.Destination = destination;
    }
    if (expirationISOString) {
      const dateTimeInMs = new Date(expirationISOString).getTime();
      const differenceInMs = dateTimeInMs - RIPPLE_EPOCH_IN_MS;
      nfTokenCreateSellOfferPayload.Expiration = Math.floor(
        differenceInMs / MS_IN_S
      );
    }

    return this.#client.submitAndWait(nfTokenCreateSellOfferPayload, {
      wallet,
    });
  };

  public listNftSellOffers = async (tokenId: string) => {
    try {
      return await this.#client.request({
        command: 'nft_sell_offers',
        tokenid: tokenId,
      });
    } catch (error: unknown) {
      return [];
    }
  };

  /**
   * Note that this transaction type is used for both BUY and SELLs.
   * The differentiators are the various properties of the payload.
   *
   * BUY requires:
   * - Owner of the NFT to be defined
   * - No Flag.tfSellToken to be set
   *
   * {@link https://xrpl.org/nftokencreateoffer.html}
   */
  public createNftBuyOffer = async ({
    amount,
    owner,
    tokenId,
    destination,
  }: {
    amount: Amount | number;
    owner: string;
    tokenId: string;
    destination?: string;
  }): Promise<TxResponse> => {
    const wallet = await this.connectAndGetWallet();
    const nfTokenCreateBuyOfferPayload: NFTokenCreateOffer = {
      TransactionType: 'NFTokenCreateOffer',
      Account: wallet.address,
      Amount: typeof amount === 'number' ? xrpToDrops(amount) : amount,
      Owner: owner,
      TokenID: tokenId,
    };

    // [To-Clarify] Is this field needed for buy offers?
    if (destination) {
      nfTokenCreateBuyOfferPayload.Destination = destination;
    }

    return this.#client.submitAndWait(nfTokenCreateBuyOfferPayload, { wallet });
  };

  public listNftBuyOffers = async (tokenId: string) => {
    try {
      return await this.#client.request({
        command: 'nft_buy_offers',
        tokenid: tokenId,
      });
    } catch (error: unknown) {
      return [];
    }
  };

  /**
   * {@link https://xrpl.org/nftokencanceloffer.html}
   * @param tokenOfferIndices array of NFT offer `index`es
   */
  public cancelNftOffers = async (tokenOfferIndices: string[]) => {
    const wallet = await this.connectAndGetWallet();
    const cancelNftOffersPayload: NFTokenCancelOffer = {
      TransactionType: 'NFTokenCancelOffer',
      Account: wallet.address,
      TokenOffers: tokenOfferIndices,
    };

    return this.#client.submitAndWait(cancelNftOffersPayload, { wallet });
  };

  /**
   * For cases where a buyer can accept a sell offer from a NFT owner.
   * {@link https://xrpl.org/nftokenacceptoffer.html}
   */
  public acceptNftSellOffer = async (
    offerIndex: string,
    brokerFee?: Amount
  ): Promise<TxResponse> => {
    const wallet = await this.connectAndGetWallet();
    const acceptNftSellOfferPayload: NFTokenAcceptOffer = {
      TransactionType: 'NFTokenAcceptOffer',
      Account: wallet.address,
      SellOffer: offerIndex,
    };

    if (brokerFee) {
      acceptNftSellOfferPayload.BrokerFee = brokerFee;
    }

    return this.#client.submitAndWait(acceptNftSellOfferPayload, { wallet });
  };

  public acceptNftBuyOffer = acceptNftBuyOffer.bind(
    null,
    this.stateRefProvider
  );
}
