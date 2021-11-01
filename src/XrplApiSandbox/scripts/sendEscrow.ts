import { xrplClient, xrplClientTwo } from '../index';
import { logMessageAndPass } from '../utilities';

// Generate testnet wallets
const generateWalletRequestOne = xrplClient
  .generateFaucetWallet()
  .then(
    logMessageAndPass('TimeHeldEscrow -- Created faucet wallet for Client 1')
  );
const generateWalletRequestTwo = xrplClientTwo
  .generateFaucetWallet()
  .then(
    logMessageAndPass('TimeHeldEscrow -- Created faucet wallet for Client 2')
  );

const ESCROW_DELAY = 20; // seconds

const RELEASE_DATE_IN_SECONDS =
  Math.floor(new Date().getTime() / 1000) + ESCROW_DELAY;
let offerSequence: number;

// After testnet wallet creations, send a 22 XRP payment
Promise.all([generateWalletRequestOne, generateWalletRequestTwo])
  .then(() =>
    xrplClient.createEscrow(
      22,
      xrplClientTwo.wallet()?.account.address!,
      RELEASE_DATE_IN_SECONDS
    )
  )
  .then(
    logMessageAndPass(
      'TimeHeldEscrow -- Created time held escrow from Wallet 1 to Wallet 2'
    )
  )
  .then((transactionEvent: any) => {
    offerSequence = transactionEvent.transaction.Sequence;
    console.log('TimeHeldEscrow -- Waiting for escrow time', offerSequence);
    return offerSequence;
  })
  .then(
    (response: any) =>
      new Promise((resolve: any) =>
        setTimeout(() => resolve(response), ESCROW_DELAY * 1000)
      )
  )
  .then(
    logMessageAndPass(
      'TimeHeldEscrow -- Attempting to finish escrow in Wallet 2'
    )
  )
  .then(() => {
    return xrplClientTwo.finishEscrow(
      xrplClient.wallet()?.account.address!,
      offerSequence
    );
  })
  .then(
    logMessageAndPass('TimeHeldEscrow -- Finished time held escrow in Wallet 2')
  );
