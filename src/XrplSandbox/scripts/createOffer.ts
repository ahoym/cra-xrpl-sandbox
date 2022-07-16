import { TEST_NET_EXPLORER } from '../constants';
import { xrplClient1, xrplClient2 } from '../createClients';
import {
  issueCurrencyAndSetupTrustlineProcedure,
  ISSUED_CURENCY_TOKEN,
} from './issueCurrency';

console.log('========🪙 Place order(s) script 🪙========');

export const createCurrencyOfferFromReceiver =
  issueCurrencyAndSetupTrustlineProcedure
    .then(() =>
      xrplClient2.createOffer({
        // amount to sell
        TakerGets: {
          currency: ISSUED_CURENCY_TOKEN,
          issuer: xrplClient1.wallet()!.address,
          value: '100',
        },
        // amount to buy
        TakerPays: 10,
      })
    )
    .then((response: any) => {
      console.log(
        `Created offer from Receiver for Issued Currency ${ISSUED_CURENCY_TOKEN}`
      );
      console.log(
        `See TestNet explorer: ${TEST_NET_EXPLORER}accounts/${response.result.Account}`
      );
      return response;
    });

// place an order (or many orders) from receiver
export const createCurrencyOfferFromIssuer =
  issueCurrencyAndSetupTrustlineProcedure
    .then(() =>
      xrplClient1.createOffer({
        // amount to buy
        TakerGets: 10, // XRP
        // amount to sell
        TakerPays: {
          currency: ISSUED_CURENCY_TOKEN,
          issuer: xrplClient1.wallet()!.address,
          value: '100',
        },
      })
    )
    .then((response: any) => {
      console.log(
        `Created offer from Issuer for Issued Currency ${ISSUED_CURENCY_TOKEN}`
      );
      console.log(
        `See TestNet explorer: ${TEST_NET_EXPLORER}accounts/${response.result.Account}`
      );
      return response;
    })
    .finally(() =>
      console.log('========🪙 Finished Place order(s) script 🪙========')
    );

// TODO: make a 3rd account, Trustline to issuer, and place corresponding offers contra receiver
