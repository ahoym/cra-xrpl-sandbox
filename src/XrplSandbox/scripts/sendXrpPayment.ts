import { logMessageAndPass } from '../../utilities';
import { xrplClient1, xrplClient2 } from '../createClients';

console.log('========💰 Starting sendXrpPayment script 💰========');

/**
 * For those that prefer to sandbox through script form.
 * Import this file in the App.tsx file to have this executed on application load.
 */

// Generate testnet wallets
const generateWalletRequestOne = xrplClient1
  .generateWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 1'));
const generateWalletRequestTwo = xrplClient2
  .generateWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 2'));

// After testnet wallet creations, send a 22 XRP payment
Promise.all([generateWalletRequestOne, generateWalletRequestTwo])
  .then(() => xrplClient1.sendPayment(22, xrplClient2.wallet()?.address!))
  .then(logMessageAndPass('Sent transaction from Wallet 1 to Wallet 2'))
  .finally(() =>
    console.log('========💰 Finished the sendXrpPayment script 💰========')
  );
