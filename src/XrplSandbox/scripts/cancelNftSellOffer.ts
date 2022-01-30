import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';
import { mintNftAndCreateSellOfferProcedure } from './createNftSellOffer';

let tokenId: string;

mintNftAndCreateSellOfferProcedure
  .then((listSellOffersResponse) => {
    tokenId = listSellOffersResponse.result.tokenid;
    return listSellOffersResponse.result.offers[0];
  })
  .then(logMessageAndPass('Selected first NFT Sell Offer'))
  .then((firstNftOffer) => {
    return nftDevNetXrplClient1.cancelNftOffers([firstNftOffer.index]);
  })
  .then(logMessageAndPass('Cancel first NFT Sell Offer'))
  .then(() => nftDevNetXrplClient1.listNftSellOffers(tokenId))
  .then(logMessageAndPass('Listed new sell offers for the NFT'));
