import { xrplClient, xrplClientTwo } from '../index';
import { logMessageAndPass } from '../utilities';

// Generate testnet wallets
const generateWalletRequestOne = xrplClient
  .generateFaucetWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 1'));
const generateWalletRequestTwo = xrplClientTwo
  .generateFaucetWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 2'));

// After testnet wallet creations, send a 22 XRP payment
Promise.all([generateWalletRequestOne, generateWalletRequestTwo])
  .then(() =>
    xrplClient.sendPayment(22, xrplClientTwo.wallet()?.account.address!)
  )
  .then(logMessageAndPass('Sent transaction from Wallet 1 to Wallet 2'));
