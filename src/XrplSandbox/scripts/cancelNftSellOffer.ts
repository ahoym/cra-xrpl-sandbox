import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';
import { mintNftAndCreateSellOfferProcedure } from './createNftSellOffer';

console.log('🪙 Starting cancelNftSellOffer script 🪙');

let tokenId: string;

mintNftAndCreateSellOfferProcedure
  .then((listSellOffersResponse) => {
    tokenId = listSellOffersResponse.result.nft_id;
    return listSellOffersResponse.result.offers[0];
  })
  .then(logMessageAndPass('Selected first NFT Sell Offer'))
  .then((firstNftOffer) =>
    nftDevNetXrplClient1.cancelNftOffers([firstNftOffer.nft_offer_index])
  )
  .then(logMessageAndPass('Canceled first NFT Sell Offer'))
  .then(() => nftDevNetXrplClient1.listNftSellOffers(tokenId))
  .then(logMessageAndPass('Listed new sell offers for the NFT'))
  .finally(() => console.log('🪙 Finished the cancelNftSellOffer script 🪙'));
