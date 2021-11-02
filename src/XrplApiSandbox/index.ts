// NOTE: Made ripple-lib a frontend dependency for experimenting/sandboxing only.
// Any mature implementations should move this to a dedicated server instead.
import {
  APIOptions,
  Instructions,
  Prepare,
  RippleAPI,
  TransactionJSON,
} from 'ripple-lib';
import { FaucetWallet } from 'ripple-lib/dist/npm/wallet/wallet-generation';

const RIPPLE_EPOCH = 946684800;

const ONE_MINUTE_MS = 60 * 1000;
const FIVE_MINUTES_MS = 5 * ONE_MINUTE_MS;

interface SubscribeOptions {
  accounts: string[];
}

type TxEvent = {
  ledger_hash: string;
  ledger_index: number;
  status: string;
  type: string;
  validated: boolean;
  transactions: TransactionJSON;
};

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

  public connectAndGetWallet = async () => {
    if (this.#wallet === null) {
      throw new Error('Input wallet credentials or instantiate a new one.');
    }

    await this.connect();
    return this.#wallet;
  };

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

  public prepareEscrowCreate = async (
    xrpAmount: number,
    destination: string,
    releaseDateInSeconds: number,
    instructions?: Instructions
  ) => {
    const wallet = await this.connectAndGetWallet();

    return this.#api.prepareTransaction(
      {
        TransactionType: 'EscrowCreate',
        Account: wallet.account.xAddress,
        Amount: this.#api.xrpToDrops(xrpAmount),
        Destination: destination,
        FinishAfter: releaseDateInSeconds,
      },
      instructions
    );
  };

  public createEscrow = (
    xrpAmount: number,
    destination: string,
    releaseDateInSeconds: number,
    instructions?: Instructions
  ) => {
    const escrowReleaseDate = releaseDateInSeconds - RIPPLE_EPOCH;
    const submittedEscrow = this.prepareEscrowCreate(
      xrpAmount,
      destination,
      escrowReleaseDate,
      {
        // Expire this transaction if it doesn't execute within ~5 minutes:
        maxLedgerVersionOffset: 75,
        ...instructions,
      }
    );

    return this.signAndWaitForTxValidation(submittedEscrow);
  };

  public prepareEscrowFinish = (
    escrowOwner: string,
    offerSequence: number,
    instructions?: Instructions
  ) => {
    return this.#api.prepareTransaction(
      {
        TransactionType: 'EscrowFinish',
        Account: escrowOwner,
        Owner: escrowOwner,
        OfferSequence: offerSequence,
      },
      instructions
    );
  };

  public finishEscrow = (
    escrowOwner: string,
    offerSequence: number,
    instructions?: Instructions
  ) => {
    const submittedEscrow = this.prepareEscrowFinish(
      escrowOwner,
      offerSequence,
      {
        // Expire this transaction if it doesn't execute within ~5 minutes:
        maxLedgerVersionOffset: 75,
        ...instructions,
      }
    );

    return this.signAndWaitForTxValidation(submittedEscrow);
  };

  public preparePayment = async (
    xrpAmount: number,
    destination: string,
    instructions?: Instructions
  ) => {
    const wallet = await this.connectAndGetWallet();

    return this.#api.prepareTransaction(
      {
        TransactionType: 'Payment',
        Account: wallet.account.xAddress,
        Amount: this.#api.xrpToDrops(xrpAmount),
        Destination: destination,
      },
      instructions
    );
  };

  public sendPayment = async (
    xrpAmount: number,
    destination: string,
    instructions?: Instructions
  ) => {
    const submittedPayment = this.preparePayment(xrpAmount, destination, {
      // Expire this transaction if it doesn't execute within ~5 minutes:
      maxLedgerVersionOffset: 75,
      ...instructions,
    });

    return this.signAndWaitForTxValidation(submittedPayment);
  };

  public getTransaction = (txId: string) => {
    return this.#api.getTransaction(txId);
  };

  public subscribeToAccountTransactions = async (
    subscribeOptions: SubscribeOptions,
    onTransaction: (event: TxEvent) => Promise<unknown> | unknown
  ) => {
    await this.connect();

    this.#api.request('subscribe', {
      accounts: subscribeOptions.accounts,
    });

    this.#api.connection.on('transaction', (event: TxEvent) => {
      onTransaction(event);
    });
  };

  private waitForTxValidation = (
    txId: string,
    maxLedgerVersion?: number,
    subscribeOptions?: SubscribeOptions
  ) => {
    let accounts: string[] = [];

    if (subscribeOptions?.accounts) {
      accounts = subscribeOptions.accounts;
    } else if (this.#wallet) {
      accounts = [this.#wallet.account.address!];
    }

    this.#api.request('subscribe', {
      accounts,
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
        if (maxLedgerVersion) {
          if (ledger.ledgerVersion > maxLedgerVersion && !hasFinalStatus) {
            hasFinalStatus = true;
            reject(txId); // If transation hasn't succeeded by now, it's expired
          }
        } else {
          const timeout = setTimeout(() => {
            reject(txId);
            clearTimeout(timeout);
          }, FIVE_MINUTES_MS);
        }
      });
    });
  };

  private signAndWaitForTxValidation = async (
    transactionPreparation: Promise<Prepare>
  ) => {
    if (this.#wallet === null) {
      throw new Error('Input wallet credentials or instantiate a new one.');
    }

    const preparedTx = await transactionPreparation;
    const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion!;
    const signed = await this.#api.sign(
      preparedTx.txJSON,
      this.#wallet!.account.secret
    );

    this.#api.submit(signed.signedTransaction);

    return this.waitForTxValidation(signed.id, maxLedgerVersion);
  };
}

const TEST_NET = 'wss://s.altnet.rippletest.net:51233';

export function generateTestnetXrplClient() {
  return new RippleAPIClient({ server: TEST_NET });
}

export const xrplClient = generateTestnetXrplClient();
export const xrplClientTwo = generateTestnetXrplClient();
const publicRippleAPI = new RippleAPI({ server: TEST_NET });

// Place RippleAPI on the window so developers can experiment with
// it in the web console
(window as any).RippleAPI = RippleAPI;
(window as any).publicRippleAPI = publicRippleAPI;
(window as any).xrplClient = xrplClient;
(window as any).xrplClientTwo = xrplClientTwo;
