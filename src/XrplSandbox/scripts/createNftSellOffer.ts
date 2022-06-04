import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';
import { NFT } from '../types';
import { mintTransferableNftProcedure } from './mintTransferableNft';

console.log('🪙 Starting createNftSellOffer script 🪙');

/**
 * See ./mintTransferableNft.ts on how to instantiate a sandbox client from
 * Faucet generated wallet credentials.
 */

const RANDOM_XRP_VALUE = Math.round(Math.random() * 100);
let tokenId: string;

export const mintNftAndCreateSellOfferProcedure = mintTransferableNftProcedure
  .then((baseResponse: any) => baseResponse.result.account_nfts)
  .then(logMessageAndPass('See specific NFTs on wallet'))
  .then((nfts: NFT[]) => {
    tokenId = nfts[0].NFTokenID;
    return nfts[0].NFTokenID;
  })
  .then(logMessageAndPass('Selected first NFT'))
  .then(nftDevNetXrplClient1.listNftSellOffers)
  .then(logMessageAndPass('Listed sell offers for the NFT'))
  .then(() =>
    nftDevNetXrplClient1.createNftSellOffer({
      amount: RANDOM_XRP_VALUE,
      tokenId,
    })
  )
  .then(
    logMessageAndPass(`Created sell offer for NFT for ${RANDOM_XRP_VALUE} XRP`)
  )
  .then(() => nftDevNetXrplClient1.listNftSellOffers(tokenId))
  .then(logMessageAndPass('Listed new sell offers for the NFT'))
  .finally(() => console.log('🪙  Finished the createNftSellOffer script 🪙'));
