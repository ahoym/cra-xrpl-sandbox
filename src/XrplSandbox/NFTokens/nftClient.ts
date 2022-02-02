import {
  NFTokenAcceptOffer,
  NFTokenCancelOffer,
  NFTokenCreateOffer,
  NFTokenCreateOfferFlags,
  TxResponse,
  xrpToDrops,
} from 'xrpl';
import { Amount } from 'xrpl/dist/npm/models/common';
import { MS_IN_S, RIPPLE_EPOCH_IN_MS } from '../constants';
import { StateRefProvider } from '../types';

/**
 * Note that this transaction type is used for both BUY and SELLs.
 * The differentiators are the various properties of the payload.
 *
 * SELL requires:
 * - Flag.tfSellToken to be set
 *
 * {@link https://xrpl.org/nftokencreateoffer.html}
 */
export const createNftSellOffer = async (
  stateRefProvider: StateRefProvider,
  {
    amount,
    tokenId,
    destination,
    expirationISOString,
  }: {
    amount: Amount | number;
    tokenId: string;
    destination?: string;
    expirationISOString?: string;
  }
): Promise<TxResponse> => {
  const { client, wallet } = await stateRefProvider();
  const nfTokenCreateSellOfferPayload: NFTokenCreateOffer = {
    TransactionType: 'NFTokenCreateOffer',
    Account: wallet.address,
    Amount: typeof amount === 'number' ? xrpToDrops(amount) : amount,
    TokenID: tokenId,
    Flags: NFTokenCreateOfferFlags.tfSellToken,
  };

  if (destination) {
    nfTokenCreateSellOfferPayload.Destination = destination;
  }
  if (expirationISOString) {
    const dateTimeInMs = new Date(expirationISOString).getTime();
    const differenceInMs = dateTimeInMs - RIPPLE_EPOCH_IN_MS;
    nfTokenCreateSellOfferPayload.Expiration = Math.floor(
      differenceInMs / MS_IN_S
    );
  }

  return client.submitAndWait(nfTokenCreateSellOfferPayload, {
    wallet,
  });
};

/**
 * Note that this transaction type is used for both BUY and SELLs.
 * The differentiators are the various properties of the payload.
 *
 * BUY requires:
 * - Owner of the NFT to be defined
 * - No Flag.tfSellToken to be set
 *
 * {@link https://xrpl.org/nftokencreateoffer.html}
 */
export const createNftBuyOffer = async (
  stateRefProvider: StateRefProvider,
  {
    amount,
    owner,
    tokenId,
    destination,
  }: {
    amount: Amount | number;
    owner: string;
    tokenId: string;
    destination?: string;
  }
): Promise<TxResponse> => {
  const { client, wallet } = await stateRefProvider();
  const nfTokenCreateBuyOfferPayload: NFTokenCreateOffer = {
    TransactionType: 'NFTokenCreateOffer',
    Account: wallet.address,
    Amount: typeof amount === 'number' ? xrpToDrops(amount) : amount,
    Owner: owner,
    TokenID: tokenId,
  };

  // [To-Clarify] Is this field needed for buy offers?
  if (destination) {
    nfTokenCreateBuyOfferPayload.Destination = destination;
  }

  return client.submitAndWait(nfTokenCreateBuyOfferPayload, { wallet });
};

export const listNftSellOffers = async (
  stateRefProvider: StateRefProvider,
  tokenId: string
) => {
  const { client } = await stateRefProvider();

  try {
    return await client.request({
      command: 'nft_sell_offers',
      tokenid: tokenId,
    });
  } catch (error: unknown) {
    return [];
  }
};

export const listNftBuyOffers = async (
  stateRefProvider: StateRefProvider,
  tokenId: string
) => {
  const { client } = await stateRefProvider();

  try {
    return await client.request({
      command: 'nft_buy_offers',
      tokenid: tokenId,
    });
  } catch (error: unknown) {
    return [];
  }
};

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
