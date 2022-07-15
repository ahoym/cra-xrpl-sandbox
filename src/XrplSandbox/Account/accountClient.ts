import { AccountDelete, AccountSet } from 'xrpl';
import { StateRefProvider } from '../types';

export const setAccount = async (
  stateRefProvider: StateRefProvider,
  accountSetTx: Partial<AccountSet>
) => {
  const { client, wallet } = await stateRefProvider();
  const setAccountTxPayload: AccountSet = await client.autofill({
    ...accountSetTx,
    TransactionType: 'AccountSet',
    Account: wallet.address,
  });
  const signed = wallet.sign(setAccountTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const deleteAccount = async (
  stateRefProvider: StateRefProvider,
  { destination }: { destination: string },
  accountDeleteTx: Partial<AccountDelete>
) => {
  const { client, wallet } = await stateRefProvider();
  const deleteAccountTxPayload: AccountDelete = await client.autofill({
    ...accountDeleteTx,
    TransactionType: 'AccountDelete',
    Account: wallet.address,
    Destination: destination,
  });
  const signed = wallet.sign(deleteAccountTxPayload);

  return client.submitAndWait(signed.tx_blob);
};
