import { AccountSetAsfFlags } from 'xrpl';
import { logMessageAndPass } from '../../utilities';
import { xrplClient1, xrplClient2 } from '../createClients';
import { XrplClient } from '../XrplClient';
import { generateWallet } from './generateWallet';

console.log('========🪙 Issue Currency script 🪙========');

export const ISSUED_CURENCY_TOKEN = 'PLZ';
const ISSUED_CURENCY_TOKEN_AMOUNT = '10000';

const setRipplingForIssuerProcedure = generateWallet(xrplClient1, {
  clientDescription: 'Issuer',
  fromSeed: '',
})
  .then(() =>
    xrplClient1.setAccount({ SetFlag: AccountSetAsfFlags.asfDefaultRipple })
  )
  .then(logMessageAndPass('Set default rippling for Issuer Client'));

export function createTrustSetForReceiver({
  receiverClient,
  issuerClient = xrplClient1,
  receiverClientSecret,
  issuerClientSecret,
}: {
  receiverClient: XrplClient;
  issuerClient?: XrplClient;
  receiverClientSecret?: string;
  issuerClientSecret?: string;
}): Promise<[XrplClient, XrplClient]> {
  const issuerWalletPromise = generateWallet(issuerClient, {
    clientDescription: 'Issuer',
    fromSeed: issuerClientSecret,
  });
  const receiverWalletPromise = generateWallet(receiverClient, {
    clientDescription: 'Receiver',
    fromSeed: receiverClientSecret,
  });

  return Promise.all([issuerWalletPromise, receiverWalletPromise])
    .then(([issuerWallet]) =>
      receiverClient.setTrust({
        limitAmount: {
          issuer: issuerWallet.address,
          currency: ISSUED_CURENCY_TOKEN,
          value: ISSUED_CURENCY_TOKEN_AMOUNT,
        },
      })
    )
    .then(logMessageAndPass('Created Trustline between Issuer and Receiver'))
    .then(() => [issuerClient, receiverClient]);
}

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
