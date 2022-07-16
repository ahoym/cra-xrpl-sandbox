import { NFTOffer } from 'xrpl/dist/npm/models/common';
import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1, nftDevNetXrplClient2 } from '../createClients';
import { NFT } from '../types';
import { CLIENT_TWO_FAUCET_WALLET_SECRET } from './CONFIG';
import { generateWallet } from './generateWallet';
import { mintTransferableNftProcedure } from './mintTransferableNft';

console.log('🪙 Starting acceptNftSellOffer script 🪙');

/**
 * Use case_1:
 * - Someone (Client1) who mints a NFT wants to sell it specifically to someone else (Client2)
 * - Client1 creates a NFT sell offer with the destination of Client2.address
 * - Client2 accepts the NFT sell offer
 * - Client2 receives the NFT
 *
 * Use case_2:
 * - Someone (Client1) who mints a NFT wants to sell it to anyone
 * - Client1 creates a NFT sell offer with no destination
 * - Client2 (or any client) can accept the NFT sell offer
 * - Client2 (or any client) receives the NFT
 */

const RANDOM_XRP_VALUE = Math.round(Math.random() * 100);
let tokenId: string;

const selectNftToSell = mintTransferableNftProcedure
  .then((baseResponse: any) => baseResponse.result.account_nfts)
  .then(logMessageAndPass('See specific NFTs on the Client1 wallet'))
  .then((nfts: NFT[]) => {
    tokenId = nfts[0].NFTokenID;
    return nfts[0].NFTokenID;
  })
  .then(logMessageAndPass('Selected first NFT from Client1 wallet'));

const generateWalletForClient2 = generateWallet(nftDevNetXrplClient2, {
  clientDescription: 'NFT-Devnet Client2',
  fromSeed: CLIENT_TWO_FAUCET_WALLET_SECRET,
});

Promise.all([selectNftToSell, generateWalletForClient2])
  .then(() =>
    nftDevNetXrplClient1.createNftSellOffer({
      amount: RANDOM_XRP_VALUE,
      tokenId,
      destination: nftDevNetXrplClient2.wallet()?.address,
    })
  )
  .then(
    logMessageAndPass(`Created sell offer for NFT for ${RANDOM_XRP_VALUE} XRP`)
  )
  .then(() => nftDevNetXrplClient1.listNftSellOffers(tokenId))
  .then(logMessageAndPass('Listed new sell offers for the NFT'))
  // Use case_1
  .then((listSellOffersResponse) => {
    const specificSellOffer = listSellOffersResponse.result.offers.find(
      (offer: NFTOffer) =>
        offer.destination === nftDevNetXrplClient2.wallet()?.address
    );
    tokenId = listSellOffersResponse.result.nft_id;
    return specificSellOffer;
  })
  .then(logMessageAndPass('Selected NFT Sell Offer specified for NFT Wallet 2'))
  /**
   // Use case_2
   .then((listSellOffersResponse) => {
     const cheapestSellOffer = listSellOffersResponse.result.offers.reduce(
       (prev: NFTOffer, curr: NFTOffer) =>
         Number(prev.amount) < Number(curr.amount) ? prev : curr
     );
     tokenId = listSellOffersResponse.result.nft_id;
     return cheapestSellOffer;
   })
   .then(logMessageAndPass('Selected cheapest NFT Sell Offer'))
   */
  .then((offer: NFTOffer) =>
    nftDevNetXrplClient2.acceptNftSellOffer(offer.nft_offer_index)
  )
  .then(logMessageAndPass('Client2 accepted sell offer from Client1 for NFT'))
  .then(() => nftDevNetXrplClient1.listNftSellOffers(tokenId))
  .then(logMessageAndPass('Listed sell offers for the NFT (should be 0)'))
  .then(() => nftDevNetXrplClient2.viewOwnNfts())
  .then(logMessageAndPass('List NFTs on the Client2 wallet account response'))
  .finally(() => console.log('🪙 Finished the acceptNftSellOffer script 🪙'));
