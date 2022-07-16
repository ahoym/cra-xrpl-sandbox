import { OfferCancel, OfferCreate, xrpToDrops } from 'xrpl';
import { Amount } from 'xrpl/dist/npm/models/common';
import { StateRefProvider } from '../types';

export const createOffer = async (
  stateRefProvider: StateRefProvider,
  {
    TakerGets,
    TakerPays,
    ...rest
  }:
    | OfferCreate
    | {
        TakerGets: number | Amount;
        TakerPays: number | Amount;
      }
) => {
  const { client, wallet } = await stateRefProvider();
  const offerCreateTxPayload: OfferCreate = await client.autofill({
    ...rest,
    TransactionType: 'OfferCreate',
    Account: wallet.address,
    TakerGets:
      typeof TakerGets === 'number' ? xrpToDrops(TakerGets) : TakerGets,
    TakerPays:
      typeof TakerPays === 'number' ? xrpToDrops(TakerPays) : TakerPays,
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
