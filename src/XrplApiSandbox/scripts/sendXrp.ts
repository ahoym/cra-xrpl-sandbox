import { generateTestnetXrplClient, xrplClient } from '../index';
import { logMessageAndPass } from '../utilities';

const clientOne = xrplClient;
const clientTwo = generateTestnetXrplClient();

// Generate testnet wallets
const generateWalletRequestOne = clientOne
  .generateFaucetWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 1'));
const generateWalletRequestTwo = clientTwo
  .generateFaucetWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 2'));

// After testnet wallet creations, send a 22 XRP payment
Promise.all([generateWalletRequestOne, generateWalletRequestTwo])
  .then(() => clientOne.sendPayment(22, clientTwo.wallet()?.account.address!))
  .then(logMessageAndPass('Sent transaction from Wallet 1 to Wallet 2'));
