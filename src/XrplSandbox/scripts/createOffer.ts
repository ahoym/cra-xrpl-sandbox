import { logMessageAndPass } from '../../utilities';
import { generateTestnetXrplClient } from '../createClients';
import {
  createTrustSetForReceiver,
  issueCurrencyAndSetupTrustlineProcedure,
  ISSUED_CURENCY_TOKEN,
} from './issueCurrency';

console.log('========🪙 Place order(s) script 🪙========');

export const createCurrencyOfferFromReceiver =
  issueCurrencyAndSetupTrustlineProcedure
    .then(([issuerClient, receiverClient]) =>
      Promise.all([
        receiverClient.createOffer({
          TakerGets: {
            currency: ISSUED_CURENCY_TOKEN,
            issuer: issuerClient.wallet()!.address,
            value: '300',
          },
          TakerPays: 30,
        }),
        receiverClient.createOffer({
          TakerGets: {
            currency: ISSUED_CURENCY_TOKEN,
            issuer: issuerClient.wallet()!.address,
            value: '100',
          },
          TakerPays: 10,
        }),
      ])
    )
    .then((response: any) => {
      console.log(
        `Created offers from Receiver for Issued Currency ${ISSUED_CURENCY_TOKEN}. From Client 2.`
      );
      return response;
    });

// place an order (or many orders) from receiver
export const createCurrencyOfferFromIssuer =
  issueCurrencyAndSetupTrustlineProcedure
    .then(([issuerClient]) =>
      issuerClient.createOffer({
        TakerGets: 10, // XRP
        TakerPays: {
          currency: ISSUED_CURENCY_TOKEN,
          issuer: issuerClient.wallet()!.address,
          value: '100',
        },
      })
    )
    .then((response: any) => {
      console.log(
        `Created offer from Issuer for Issued Currency ${ISSUED_CURENCY_TOKEN}`
      );
      return response;
    })
    .finally(() =>
      console.log('========🪙 Finished Place order(s) script 🪙========')
    );

const xrplClient3 = generateTestnetXrplClient();

issueCurrencyAndSetupTrustlineProcedure
  .then(logMessageAndPass('Attempting to create offer from Client 3'))
  .then(() =>
    createTrustSetForReceiver({
      issuerClientSecret: '',
      receiverClient: xrplClient3,
      receiverClientSecret: '',
    })
  )
  .then(logMessageAndPass('For 3rd Client'))
  .then(([issuerClient, receiverClient]) =>
    receiverClient.createOffer({
      TakerGets: 20, // XRP
      TakerPays: {
        currency: ISSUED_CURENCY_TOKEN,
        issuer: issuerClient.wallet()!.address,
        value: '200',
      },
    })
  )
  .then((response: any) => {
    console.log(
      `Created offer from Issuer for Issued Currency ${ISSUED_CURENCY_TOKEN}. From Client 3.`
    );
    return response;
  })
  .finally(() =>
    console.log('========🪙 Finished Place order(s) script 🪙========')
  );
