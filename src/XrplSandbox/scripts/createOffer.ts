import { logMessageAndPass } from '../../utilities';
import { generateTestnetXrplClient } from '../createClients';
import {
  createTrustSetForReceiver,
  ISSUED_CURENCY_TOKEN,
} from './createTrustSetForReceiver';
import { issueCurrencyAndSetupTrustlineProcedure } from './issueCurrency';

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

/**
 * TODO:
 *
 * - Move account set up (rippling @ issuer, trust set(s)) to a global function to execute first.
 *    - Ascertain whether a trust set can be set once. Currently, multiple runs of this script
 *      will set a trust set every single time.
 *    - Ascertain whether a trust set is necessary for an account that isnt issued currencies (Client 3).
 *
 * - Disco more into offers, how one may be broken up given multiple buyers for a sell.
 *
 * - Disco offers using two issued currencies instead of XRP.
 *
 * - Disco "rippled" offers using XRP as the common conra asset.
 */
