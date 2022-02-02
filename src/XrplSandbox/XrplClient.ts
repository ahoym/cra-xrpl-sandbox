import { Client, ClientOptions, TxResponse, Wallet, xrpToDrops } from 'xrpl';
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
}
