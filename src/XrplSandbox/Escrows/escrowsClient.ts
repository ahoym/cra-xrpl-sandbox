import { EscrowCancel, EscrowCreate, EscrowFinish, xrpToDrops } from 'xrpl';
import { RIPPLE_EPOCH } from '../constants';
import { StateRefProvider } from '../types';

export const cancelEscrow = async (
  stateRefProvider: StateRefProvider,
  { offerSequence, owner }: { offerSequence: number; owner: string }
) => {
  const { client, wallet } = await stateRefProvider();
  const escrowCancelTxPayload: EscrowCancel = {
    TransactionType: 'EscrowCancel',
    Account: wallet.address,
    Owner: owner,
    OfferSequence: offerSequence,
  };
  const signed = wallet.sign(escrowCancelTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const createEscrow = async (
  stateRefProvider: StateRefProvider,
  {
    destination,
    releaseDateInSeconds,
    xrpAmount,
  }: { destination: string; releaseDateInSeconds: number; xrpAmount: number }
) => {
  const { client, wallet } = await stateRefProvider();
  const escrowReleaseDate = releaseDateInSeconds - RIPPLE_EPOCH;
  const escrowCreateTxPayload: EscrowCreate = {
    TransactionType: 'EscrowCreate',
    Account: wallet.address,
    Amount: xrpToDrops(xrpAmount),
    Destination: destination,
    FinishAfter: escrowReleaseDate,
  };
  const signed = wallet.sign(escrowCreateTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const finishEscrow = async (
  stateRefProvider: StateRefProvider,
  {
    escrowOwner,
    offerSequence,
  }: {
    escrowOwner: string;
    offerSequence: number;
  }
) => {
  const { client, wallet } = await stateRefProvider();
  const escrowFinishTxPayload: EscrowFinish = {
    TransactionType: 'EscrowFinish',
    Account: escrowOwner,
    Owner: escrowOwner,
    OfferSequence: offerSequence,
  };
  const signed = wallet.sign(escrowFinishTxPayload);

  return client.submitAndWait(signed.tx_blob);
};
