import { AccountSetAsfFlags } from 'xrpl';
import { logMessageAndPass } from '../../utilities';
import { xrplClient1, xrplClient2 } from '../createClients';

console.log('========🪙 Issue Currency script 🪙========');

export const ISSUED_CURENCY_TOKEN = 'PLZ';
const ISSUED_CURENCY_TOKEN_AMOUNT = '10000';

const generateWalletRequestOne = xrplClient1 // Issuer
  .generateWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 1'));
const generateWalletRequestTwo = xrplClient2 // Receiver
  .generateWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 2'));

const setRipplingForIssuerProcedure = generateWalletRequestOne
  .then(() =>
    xrplClient1.setAccount({ SetFlag: AccountSetAsfFlags.asfDefaultRipple })
  )
  .then(logMessageAndPass('Set default rippling for client 1'));

const createTrustSetForReceiverProcedure = generateWalletRequestOne
  .then(() => generateWalletRequestTwo)
  .then(() =>
    xrplClient2.setTrust({
      limitAmount: {
        issuer: xrplClient1.wallet()!.address,
        currency: ISSUED_CURENCY_TOKEN,
        value: ISSUED_CURENCY_TOKEN_AMOUNT,
      },
    })
  )
  .then(logMessageAndPass('Created Trustline between Issuer and Receiver'));

export const issueCurrencyAndSetupTrustlineProcedure = Promise.all([
  setRipplingForIssuerProcedure,
  createTrustSetForReceiverProcedure,
])
  .then(() =>
    xrplClient1.sendPayment(
      {
        currency: ISSUED_CURENCY_TOKEN,
        issuer: xrplClient1.wallet()!.address,
        value: '100',
      },
      xrplClient2.wallet()!.address
    )
  )
  .then(
    logMessageAndPass(
      `Sent Issued Currency ${ISSUED_CURENCY_TOKEN} to Receiver`
    )
  );
