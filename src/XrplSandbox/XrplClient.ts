import { Client, ClientOptions, TxResponse, Wallet, xrpToDrops } from 'xrpl';
import { deleteAccount, setAccount } from './Account/accountClient';
import {
  createTicket,
  depositPreAuth,
  setRegularKey,
  setSignerList,
  setTrust,
} from './Attic/miscClient';
import { cancelCheck, cashCheck, createCheck } from './Checks/checksClient';
import {
  cancelEscrow,
  createEscrow,
  finishEscrow,
} from './Escrows/escrowsClient';
import {
  acceptNftBuyOffer,
  acceptNftSellOffer,
  burnNft,
  cancelNftOffers,
  createNftBuyOffer,
  createNftSellOffer,
  listNftBuyOffers,
  listNftSellOffers,
  mintTransferableNft,
  viewOwnNfts,
} from './NFTokens/nftClient';
import { cancelOffer, createOffer } from './Offers/offersClient';
import {
  claimPaymentChannel,
  createPaymentChannel,
  fundPaymentChannel,
} from './PaymentChannels/paymentChannelClient';

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
   * Account related methods
   */
  public setAccount = setAccount.bind(null, this.stateRefProvider);
  public deleteAccount = deleteAccount.bind(null, this.stateRefProvider);

  /**
   * Check related methods
   */
  public createCheck = createCheck.bind(null, this.stateRefProvider);
  public cancelCheck = cancelCheck.bind(null, this.stateRefProvider);
  public cashCheck = cashCheck.bind(null, this.stateRefProvider);

  /**
   * Escrow related methods
   */
  public createEscrow = createEscrow.bind(null, this.stateRefProvider);
  public finishEscrow = finishEscrow.bind(null, this.stateRefProvider);
  public cancelEscrow = cancelEscrow.bind(null, this.stateRefProvider);

  /**
   * NFT related methods
   */
  public mintTransferableNft = mintTransferableNft.bind(
    null,
    this.stateRefProvider
  );
  public viewOwnNfts = viewOwnNfts.bind(null, this.stateRefProvider);
  public burnNft = burnNft.bind(this, this.stateRefProvider);
  public createNftSellOffer = createNftSellOffer.bind(
    null,
    this.stateRefProvider
  );
  public createNftBuyOffer = createNftBuyOffer.bind(
    null,
    this.stateRefProvider
  );
  public listNftSellOffers = listNftSellOffers.bind(
    null,
    this.stateRefProvider
  );
  public listNftBuyOffers = listNftBuyOffers.bind(null, this.stateRefProvider);
  public cancelNftOffers = cancelNftOffers.bind(null, this.stateRefProvider);
  public acceptNftSellOffer = acceptNftSellOffer.bind(
    null,
    this.stateRefProvider
  );
  public acceptNftBuyOffer = acceptNftBuyOffer.bind(
    null,
    this.stateRefProvider
  );

  /**
   * Offer related methods
   */
  public createOffer = createOffer.bind(null, this.stateRefProvider);
  public cancelOffer = cancelOffer.bind(null, this.stateRefProvider);

  /**
   * PaymentChannel related methods
   */
  public createPaymentChannel = createPaymentChannel.bind(
    null,
    this.stateRefProvider
  );
  public fundPaymentChannel = fundPaymentChannel.bind(
    null,
    this.stateRefProvider
  );
  public claimPaymentChannel = claimPaymentChannel.bind(
    null,
    this.stateRefProvider
  );

  /**
   * Miscellaneous methods
   */
  public setSignerList = setSignerList.bind(null, this.stateRefProvider);
  public createTicket = createTicket.bind(null, this.stateRefProvider);
  public setTrust = setTrust.bind(null, this.stateRefProvider);
  public setRegularKey = setRegularKey.bind(null, this.stateRefProvider);
  public depositPreAuth = depositPreAuth.bind(null, this.stateRefProvider);
}
