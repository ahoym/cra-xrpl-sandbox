import { NFTokenAcceptOffer, NFTokenCancelOffer, TxResponse } from 'xrpl';
import { Amount } from 'xrpl/dist/npm/models/common';
import { StateRefProvider } from '../types';

/**
 * {@link https://xrpl.org/nftokencanceloffer.html}
 * @param tokenOfferIndices array of NFT offer `index`es
 */
export const cancelNftOffers = async (
  stateRefProvider: StateRefProvider,
  tokenOfferIndices: string[]
) => {
  const { client, wallet } = await stateRefProvider();
  const cancelNftOffersPayload: NFTokenCancelOffer = {
    TransactionType: 'NFTokenCancelOffer',
    Account: wallet.address,
    TokenOffers: tokenOfferIndices,
  };

  return client.submitAndWait(cancelNftOffersPayload, { wallet });
};

/**
 * For cases where a buyer can accept a sell offer from a NFT owner.
 * {@link https://xrpl.org/nftokenacceptoffer.html}
 */
export const acceptNftSellOffer = async (
  stateRefProvider: StateRefProvider,
  offerIndex: string,
  brokerFee?: Amount
): Promise<TxResponse> => {
  const { client, wallet } = await stateRefProvider();
  const acceptNftSellOfferPayload: NFTokenAcceptOffer = {
    TransactionType: 'NFTokenAcceptOffer',
    Account: wallet.address,
    SellOffer: offerIndex,
  };

  if (brokerFee) {
    acceptNftSellOfferPayload.BrokerFee = brokerFee;
  }

  return client.submitAndWait(acceptNftSellOfferPayload, { wallet });
};

/**
 * {@link https://xrpl.org/nftokenacceptoffer.html}
 */
export const acceptNftBuyOffer = async (
  stateRefProvider: StateRefProvider,
  offerIndex: string,
  brokerFee?: Amount
): Promise<TxResponse> => {
  const { client, wallet } = await stateRefProvider();

  const acceptNftBuyOfferPayload: NFTokenAcceptOffer = {
    TransactionType: 'NFTokenAcceptOffer',
    Account: wallet.address,
    BuyOffer: offerIndex,
  };

  if (brokerFee) {
    acceptNftBuyOfferPayload.BrokerFee = brokerFee;
  }

  return client.submitAndWait(acceptNftBuyOfferPayload, { wallet });
};
