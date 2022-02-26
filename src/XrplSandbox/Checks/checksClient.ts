import { CheckCancel, CheckCash, CheckCreate } from 'xrpl';
import { Amount } from 'xrpl/dist/npm/models/common';
import { StateRefProvider } from '../types';

export const createCheck = async (
  stateRefProvider: StateRefProvider,
  {
    destination,
    sendMax,
  }: {
    destination: string;
    sendMax: Amount;
  }
) => {
  const { client, wallet } = await stateRefProvider();
  const createCheckTxPayload: CheckCreate = {
    TransactionType: 'CheckCreate',
    Account: wallet.address,
    Destination: destination,
    SendMax: sendMax,
  };
  const signed = wallet.sign(createCheckTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const cancelCheck = async (
  stateRefProvider: StateRefProvider,
  { checkId }: { checkId: string }
) => {
  const { client, wallet } = await stateRefProvider();
  const cancelCheckTxPayload: CheckCancel = {
    TransactionType: 'CheckCancel',
    Account: wallet.address,
    CheckID: checkId,
  };
  const signed = wallet.sign(cancelCheckTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const cashCheck = async (
  stateRefProvider: StateRefProvider,
  { checkId }: { checkId: string }
) => {
  const { client, wallet } = await stateRefProvider();
  const cashCheckTxPayload: CheckCash = {
    TransactionType: 'CheckCash',
    Account: wallet.address,
    CheckID: checkId,
  };
  const signed = wallet.sign(cashCheckTxPayload);

  return client.submitAndWait(signed.tx_blob);
};
