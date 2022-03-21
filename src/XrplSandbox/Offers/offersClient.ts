import { OfferCancel, OfferCreate } from 'xrpl';
import { Amount } from 'xrpl/dist/npm/models/common';
import { StateRefProvider } from '../types';

export const createOffer = async (
  stateRefProvider: StateRefProvider,
  {
    takerGets,
    takerPays,
  }: {
    takerGets: Amount;
    takerPays: Amount;
  }
) => {
  const { client, wallet } = await stateRefProvider();
  const offerCreateTxPayload: OfferCreate = await client.autofill({
    TransactionType: 'OfferCreate',
    Account: wallet.address,
    TakerGets: takerGets,
    TakerPays: takerPays,
  });
  const signed = wallet.sign(offerCreateTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const cancelOffer = async (
  stateRefProvider: StateRefProvider,
  {
    offerSequence,
  }: {
    offerSequence: number;
  }
) => {
  const { client, wallet } = await stateRefProvider();
  const offerCreateTxPayload: OfferCancel = await client.autofill({
    TransactionType: 'OfferCancel',
    Account: wallet.address,
    OfferSequence: offerSequence,
  });
  const signed = wallet.sign(offerCreateTxPayload);

  return client.submitAndWait(signed.tx_blob);
};
