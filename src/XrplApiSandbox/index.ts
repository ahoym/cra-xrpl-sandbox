// NOTE: Made ripple-lib a frontend dependency for experimenting/sandboxing only.
// Any mature implementations should move this to a dedicated server instead.
import { APIOptions, Instructions, RippleAPI } from 'ripple-lib';
import { FaucetWallet } from 'ripple-lib/dist/npm/wallet/wallet-generation';

const publicRippleAPI = new RippleAPI({
  server: 'wss://s.altnet.rippletest.net:51233', // Testnet
});

export class RippleAPIClient {
  #api: RippleAPI;
  #wallet: FaucetWallet | null;

  constructor(options?: APIOptions) {
    this.#api = new RippleAPI(options);
    this.#wallet = null;

    this.connect();
  }

  private connect = () => {
    if (this.#api.isConnected()) {
      return Promise.resolve(true);
    }

    return this.#api.connect();
  };

  public api = () => this.#api;
  public wallet = () => this.#wallet;

  public getAccountInfo = () => {
    if (this.#wallet === null) {
      throw new Error('Input wallet credentials or instantiate a new one.');
    }

    return this.#api.getAccountInfo(this.#wallet.account.address!);
  };

  public generateFaucetWallet = () => {
    if (this.#wallet) return Promise.resolve(this.#wallet);

    return this.connect()
      .then(() => this.#api.generateFaucetWallet())
      .then((faucetWallet) => {
        if (faucetWallet) {
          this.#wallet = faucetWallet;
        }

        return this.#wallet;
      });
  };

  public preparePayment = (
    xrpAmount: number,
    destination: string,
    instructions?: Instructions
  ) => {
    if (this.#wallet === null) {
      throw new Error('Input wallet credentials or instantiate a new one.');
    }

    return this.connect().then(() =>
      this.#api.prepareTransaction(
        {
          TransactionType: 'Payment',
          Account: this.#wallet!.account.xAddress,
          Amount: this.#api.xrpToDrops(xrpAmount),
          Destination: destination,
        },
        instructions
      )
    );
  };

  public waitForTxValidation = (txId: string, maxLedgerVersion: number) => {
    this.#api.request('subscribe', {
      accounts: [this.#wallet?.account.address!],
    });
    let hasFinalStatus = false;

    return new Promise((resolve, reject) => {
      this.#api.connection.on('transaction', (event) => {
        if (event.transaction.hash === txId) {
          hasFinalStatus = true;
          resolve(event);
        }
      });

      this.#api.connection.on('ledger', (ledger) => {
        if (ledger.ledgerVersion > maxLedgerVersion && !hasFinalStatus) {
          hasFinalStatus = true;
          reject(txId); // If transation hasn't succeeded by now, it's expired
        }
      });
    });
  };

  public sendPayment = async (
    xrpAmount: number,
    destination: string,
    instructions?: Instructions
  ) => {
    if (this.#wallet === null) {
      throw new Error('Input wallet credentials or instantiate a new one.');
    }
    let maxLedgerVersion: number;

    const submittedPayment = await this.preparePayment(xrpAmount, destination, {
      // Expire this transaction if it doesn't execute within ~5 minutes:
      maxLedgerVersionOffset: 75,
      ...instructions,
    })
      .then((preparedTx) => {
        maxLedgerVersion = preparedTx.instructions.maxLedgerVersion!;
        return this.#api.sign(preparedTx.txJSON, this.#wallet!.account.secret);
      })
      .then(async (signed) => {
        const earliestLedgerVersion = (await this.#api.getLedgerVersion()) + 1;
        this.#api.submit(signed.signedTransaction);
        return { txId: signed.id, earliestLedgerVersion };
      });

    return this.waitForTxValidation(submittedPayment.txId, maxLedgerVersion!);
  };

  public getTransaction = (txId: string) => {
    return this.#api.getTransaction(txId);
  };
}

export const xrplClient = new RippleAPIClient({
  server: 'wss://s.altnet.rippletest.net:51233',
});

// Place RippleAPI on the window so developers can experiment with
// it in the web console
(window as any).RippleAPI = RippleAPI;
(window as any).publicRippleAPI = publicRippleAPI;
(window as any).xrplClient = xrplClient;
