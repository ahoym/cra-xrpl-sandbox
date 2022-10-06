import { AccountSetAsfFlags } from 'xrpl';
import { logMessageAndPass } from '../../utilities';
import { xrplClient1, xrplClient2 } from '../createClients';
import {
  createTrustSetForReceiver,
  ISSUED_CURENCY_TOKEN,
} from './createTrustSetForReceiver';
import { generateWallet } from './generateWallet';

console.log('========🪙 Issue Currency script 🪙========');

const setRipplingForIssuerProcedure = generateWallet(xrplClient1, {
  clientDescription: 'Issuer',
  fromSeed: '',
})
  .then(() =>
    xrplClient1.setAccount({ SetFlag: AccountSetAsfFlags.asfDefaultRipple })
  )
  .then(logMessageAndPass('Set default rippling for Issuer Client'));

export const issueCurrencyAndSetupTrustlineProcedure = Promise.all([
  setRipplingForIssuerProcedure,
  createTrustSetForReceiver({
    issuerClient: xrplClient1,
    issuerClientSecret: '',
    receiverClient: xrplClient2,
    receiverClientSecret: '',
  }),
])
  .then(async ([_, [issuerClient, receiverClient]]) => {
    await issuerClient.sendPayment(
      {
        currency: ISSUED_CURENCY_TOKEN,
        issuer: issuerClient.wallet()!.address,
        value: '10000',
      },
      receiverClient.wallet()!.address
    );
    return [issuerClient, receiverClient];
  })
  .then(
    logMessageAndPass(
      `Sent Issued Currency ${ISSUED_CURENCY_TOKEN} to Receiver`
    )
  )
  .finally(() =>
    console.log('========🪙 Finished Issue Currency script 🪙========')
  );
