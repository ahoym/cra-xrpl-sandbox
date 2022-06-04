import {
  NFTokenAcceptOffer,
  NFTokenBurn,
  NFTokenCancelOffer,
  NFTokenCreateOffer,
  NFTokenCreateOfferFlags,
  NFTokenMint,
  NFTokenMintFlags,
  TxResponse,
  xrpToDrops,
} from 'xrpl';
import { Amount } from 'xrpl/dist/npm/models/common';
import { MS_IN_S, RIPPLE_EPOCH_IN_MS } from '../constants';
import { StateRefProvider } from '../types';

/**
 * Specifically mint a transferable NFT
 * {@link https://xrpl.org/nftokenmint.html}
 */
export const mintTransferableNft = async (
  stateRefProvider: StateRefProvider,
  {
    transferFee,
    URI,
  }: {
    transferFee?: number;
    URI?: string;
  } = {}
): Promise<TxResponse> => {
  const { client, wallet } = await stateRefProvider();
  const nfTokenMintTxPayload: NFTokenMint = {
    TransactionType: 'NFTokenMint',
    Account: wallet.address,
    Flags: NFTokenMintFlags.tfTransferable,
    NFTokenTaxon: 0, // [To-Clarify] What is the practical use case of the TokenTaxon?
    /**
     * Issuer field also requires the AccountRoot to have the `MintAccount` field set to wallet.address.
     * This can be set through the {@link https://xrpl.org/accountset.html} AccountSet Tx.
     */
    // Issuer:     // [To-Clarify] What is the practical use case of having an Issuer account?
  };

  if (URI) {
    nfTokenMintTxPayload.URI = URI;
  }
  // Throw an error instead if desired. See NFTokenMint transaction in jsdoc to see TransferFee constraints.
  const isValidTransferFee =
    !!transferFee && transferFee >= 0 && transferFee <= 9999;
  if (isValidTransferFee) {
    nfTokenMintTxPayload.TransferFee = transferFee;
  }

  return client.submitAndWait(nfTokenMintTxPayload, { wallet });
};

/**
 * View all NFTs associated to stateRefProvider().wallet
 */
export const viewOwnNfts = async (stateRefProvider: StateRefProvider) => {
  const { client, wallet } = await stateRefProvider();

  return client.request({
    command: 'account_nfts',
    account: wallet.address,
  });
};

/**
 * {@link https://xrpl.org/nftokenburn.html}
 */
export const burnNft = async (
  stateRefProvider: StateRefProvider,
  tokenId: string
): Promise<TxResponse> => {
  const { client, wallet } = await stateRefProvider();
  const burnNftTxPayload: NFTokenBurn = {
    TransactionType: 'NFTokenBurn',
    Account: wallet.address,
    NFTokenID: tokenId,
  };

  return client.submitAndWait(burnNftTxPayload, { wallet });
};

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
    NFTokenID: tokenId,
    Flags: NFTokenCreateOfferFlags.tfSellNFToken,
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
    NFTokenID: tokenId,
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
      nft_id: tokenId,
    });
  } catch (error: unknown) {
    // Note for devs: An error is thrown if there are no offers.
    if ((error as any).message !== 'The requested object was not found.') {
      console.error('Encountered error on listNftSellOffers', error);
    }
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
      nft_id: tokenId,
    });
  } catch (error: unknown) {
    // Note for devs: An error is thrown if there are no offers.
    if ((error as any).message !== 'The requested object was not found.') {
      console.error('Encountered error on listNftSellOffers', error);
    }
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
    NFTokenOffers: tokenOfferIndices,
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
    NFTokenSellOffer: offerIndex,
  };

  if (brokerFee) {
    acceptNftSellOfferPayload.NFTokenBrokerFee = brokerFee;
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
    NFTokenBuyOffer: offerIndex,
  };

  if (brokerFee) {
    acceptNftBuyOfferPayload.NFTokenBrokerFee = brokerFee;
  }

  return client.submitAndWait(acceptNftBuyOfferPayload, { wallet });
};
