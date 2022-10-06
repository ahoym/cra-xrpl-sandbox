import { logMessageAndPass } from '../../utilities';
import { xrplClient1 } from '../createClients';
import { XrplClient } from '../XrplClient';
import { generateWallet } from './generateWallet';

export const ISSUED_CURENCY_TOKEN = 'PLZ';
const ISSUED_CURENCY_TOKEN_AMOUNT = '10000';

export function createTrustSetForReceiver({
  issuerClient = xrplClient1,
  issuerClientSecret,
  receiverClient,
  receiverClientSecret,
}: {
  issuerClient?: XrplClient;
  issuerClientSecret?: string;
  receiverClient: XrplClient;
  receiverClientSecret?: string;
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
