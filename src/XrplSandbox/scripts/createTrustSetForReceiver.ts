import { logMessageAndPass } from '../../utilities';
import { xrplClient1 } from '../createClients';
import { XrplClient } from '../XrplClient';
import { generateClientAndWalletFromSeed } from './generateWallet';

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
  receiverClient?: XrplClient;
  receiverClientSecret?: string;
}): Promise<[XrplClient, XrplClient]> {
  const issuerClientPromise = generateClientAndWalletFromSeed({
    clientDescription: 'Issuer',
    fromSeed: issuerClientSecret,
    xrplClient: issuerClient,
  });
  const receiverClientPromise = generateClientAndWalletFromSeed({
    clientDescription: 'Receiver',
    fromSeed: receiverClientSecret,
    xrplClient: receiverClient,
  });

  return Promise.all([issuerClientPromise, receiverClientPromise])
    .then(async ([generatedIssuerClient, generatedReceiverClient]) => {
      await generatedReceiverClient.setTrust({
        limitAmount: {
          issuer: generatedIssuerClient.wallet()!.address,
          currency: ISSUED_CURENCY_TOKEN,
          value: ISSUED_CURENCY_TOKEN_AMOUNT,
        },
      });
      return [generatedIssuerClient, generatedReceiverClient];
    })
    .then(logMessageAndPass('Created Trustline between Issuer and Receiver'))
    .then(([issuerClient, receiverClient]) => [issuerClient, receiverClient]);
}
