import {
  PaymentChannelClaim,
  PaymentChannelCreate,
  PaymentChannelFund,
} from 'xrpl';
import { StateRefProvider } from '../types';

export const createPaymentChannel = async (
  stateRefProvider: StateRefProvider,
  {
    amount,
    destination,
    publicKey,
    settleDelay,
  }: {
    amount: string; // TODO clarify
    destination: string;
    publicKey: string;
    settleDelay: number;
  }
) => {
  const { client, wallet } = await stateRefProvider();
  const createPaymentChannelTxPayload: PaymentChannelCreate = {
    TransactionType: 'PaymentChannelCreate',
    Account: wallet.address,
    Amount: amount,
    Destination: destination,
    PublicKey: publicKey,
    SettleDelay: settleDelay,
  };
  const signed = wallet.sign(createPaymentChannelTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const claimPaymentChannel = async (
  stateRefProvider: StateRefProvider,
  { paymentChannel }: { paymentChannel: string }
) => {
  const { client, wallet } = await stateRefProvider();
  const claimPaymentChannelTxPayload: PaymentChannelClaim = {
    TransactionType: 'PaymentChannelClaim',
    Account: wallet.address,
    Channel: paymentChannel,
  };
  const signed = wallet.sign(claimPaymentChannelTxPayload);

  return client.submitAndWait(signed.tx_blob);
};

export const fundPaymentChannel = async (
  stateRefProvider: StateRefProvider,
  { amount, paymentChannel }: { amount: string; paymentChannel: string }
) => {
  const { client, wallet } = await stateRefProvider();
  const fundPaymentChannelTxPayload: PaymentChannelFund = {
    TransactionType: 'PaymentChannelFund',
    Account: wallet.address,
    Amount: amount,
    Channel: paymentChannel,
  };
  const signed = wallet.sign(fundPaymentChannelTxPayload);

  return client.submitAndWait(signed.tx_blob);
};
