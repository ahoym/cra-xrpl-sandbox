import {
  DepositPreauth,
  SetRegularKey,
  SignerListSet,
  TicketCreate,
  TrustSet,
} from 'xrpl';
import { IssuedCurrencyAmount, SignerEntry } from 'xrpl/dist/npm/models/common';
import { StateRefProvider } from '../types';

export const setSignerList = async (
  stateRefProvider: StateRefProvider,
  {
    numRequiredSigners,
    signerEntries,
  }: { numRequiredSigners: number; signerEntries: SignerEntry[] }
) => {
  const { client, wallet } = await stateRefProvider();
  const setSignerListTxPayload: SignerListSet = {
    TransactionType: 'SignerListSet',
    Account: wallet.address,
    SignerQuorum: numRequiredSigners,
    SignerEntries: signerEntries,
  };
  const signed = wallet.sign(setSignerListTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const createTicket = async (
  stateRefProvider: StateRefProvider,
  { ticketCount }: { ticketCount: number }
) => {
  const { client, wallet } = await stateRefProvider();
  const createTicketTxPayload: TicketCreate = {
    TransactionType: 'TicketCreate',
    Account: wallet.address,
    TicketCount: ticketCount,
  };
  const signed = wallet.sign(createTicketTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const setTrust = async (
  stateRefProvider: StateRefProvider,
  { limitAmount }: { limitAmount: IssuedCurrencyAmount }
) => {
  const { client, wallet } = await stateRefProvider();
  const setTrustTxPayload: TrustSet = {
    TransactionType: 'TrustSet',
    Account: wallet.address,
    LimitAmount: limitAmount,
  };
  const signed = wallet.sign(setTrustTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const setRegularKey = async (
  stateRefProvider: StateRefProvider,
  setRegularKeyTx: Partial<SetRegularKey>
) => {
  const { client, wallet } = await stateRefProvider();
  const setRegularKeyTxPayload: SetRegularKey = {
    ...setRegularKey,
    TransactionType: 'SetRegularKey',
    Account: wallet.address,
  };
  const signed = wallet.sign(setRegularKeyTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const depositPreAuth = async (
  stateRefProvider: StateRefProvider,
  depositPreAuthTx: Partial<DepositPreauth>
) => {
  const { client, wallet } = await stateRefProvider();
  const depositPreAuthTxPayload: DepositPreauth = {
    ...depositPreAuthTx,
    TransactionType: 'DepositPreauth',
    Account: wallet.address,
  };
  const signed = wallet.sign(depositPreAuthTxPayload);

  return client.submitAndWait(signed.tx_blob);
};
