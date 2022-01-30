import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient2 } from '../createClients';
import { mintNftAndCreateBidProcedure } from './createNftBuyOffer';

let tokenId: string;

mintNftAndCreateBidProcedure
  .then((listBuyOffersResponse) => {
    tokenId = listBuyOffersResponse.result.tokenid;
    return listBuyOffersResponse.result.offers[0];
  })
  .then(logMessageAndPass('Selected first NFT Buy Offer'))
  .then((firstNftOffer) => {
    return nftDevNetXrplClient2.cancelNftOffers([firstNftOffer.index]);
  })
  .then(logMessageAndPass('Cancel first NFT Buy Offer'))
  .then(() => nftDevNetXrplClient2.listNftBuyOffers(tokenId))
  .then(logMessageAndPass('Listed new Buy offers for the NFT'));
