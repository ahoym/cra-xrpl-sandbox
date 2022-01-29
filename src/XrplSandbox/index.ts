import {
  Client,
  ClientOptions,
  Payment,
  TxResponse,
  Wallet,
  xrpToDrops,
} from 'xrpl';

const TEST_NET = 'wss://s.altnet.rippletest.net:51233';
const RIPPLE_EPOCH = 946684800;
const ONE_MINUTE_MS = 60 * 1000;
const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS;

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
    } else {
      return this.generateWallet();
    }
  };

  public generateWallet = async (fromSeed?: string): Promise<Wallet> => {
    await this.connect();

    if (fromSeed) {
      this.#wallet = Wallet.fromSeed(fromSeed);
    } else {
      // Instantiate testnet wallet
      const fundResult = await this.#client.fundWallet();
      this.#wallet = fundResult.wallet;
    }

    return this.#wallet;
  };

  public preparePayment = async (
    xrpAmount: number,
    destinationAddress: string
  ): Promise<Payment> => {
    const wallet = await this.connectAndGetWallet();

    return this.#client.autofill({
      TransactionType: 'Payment',
      Account: wallet.address,
      Amount: xrpToDrops(xrpAmount),
      Destination: destinationAddress,
    });
  };

  public sendPayment = async (
    xrpAmount: number,
    destinationAddress: string
  ): Promise<TxResponse> => {
    const wallet = await this.connectAndGetWallet();
    const preparedPayment = await this.preparePayment(
      xrpAmount,
      destinationAddress
    );
    const signed = wallet.sign(preparedPayment);

    return this.#client.submitAndWait(signed.tx_blob);
  };
}

export function generateTestnetXrplClient() {
  return new XrplClient(TEST_NET);
}

export const xrplClient1 = generateTestnetXrplClient();
export const xrplClient2 = generateTestnetXrplClient();

/**
 * Place testnet clients on window so they can be experimented with
 * in the web console.
 */
(window as any).xrplClient1 = xrplClient1;
(window as any).xrplClient2 = xrplClient2;
