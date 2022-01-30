import { NFTOffer } from 'xrpl/dist/npm/models/common';
import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1, nftDevNetXrplClient2 } from '../createClients';
import { NFT } from '../types';
import { CLIENT_TWO_FAUCET_WALLET_SECRET } from './CONFIG';
import { mintTransferableNftProcedure } from './mintTransferableNft';

/**
 * Use case:
 * - Someone (Client1) who mints a NFT wants to sell it specifically to someone else (Client2)
 * - Client1 creates a NFT sell offer with the destination of Client2.address
 * - Client2 accepts the NFT sell offer
 * - Client2 receives the NFT
 */

const RANDOM_XRP_VALUE = Math.round(Math.random() * 100);
let tokenId: string;

const selectNftToSell = mintTransferableNftProcedure
  .then((baseResponse: any) => baseResponse.result.account_nfts)
  .then(logMessageAndPass('See specific NFTs on the Client1 wallet'))
  .then((nfts: NFT[]) => {
    tokenId = nfts[0].TokenID;
    return nfts[0].TokenID;
  })
  .then(logMessageAndPass('Selected first NFT from Client1 wallet'));

const generateWalletForClient2 = nftDevNetXrplClient2
  .generateWallet(CLIENT_TWO_FAUCET_WALLET_SECRET)
  .then(logMessageAndPass('Created Client2 wallet on NFT-Devnet'));

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
  .then((listSellOffersResponse) => {
    const offer = listSellOffersResponse.result.offers.find(
      (offer: NFTOffer) =>
        offer.destination === nftDevNetXrplClient2.wallet()?.address!
    );
    tokenId = listSellOffersResponse.result.tokenid;
    return offer;
  })
  .then(logMessageAndPass('Selected first NFT Sell Offer'))
  .then((offer: NFTOffer) =>
    nftDevNetXrplClient2.acceptNftSellOffer(offer.index)
  )
  .then(logMessageAndPass('Client2 accepted sell offer from Client1 for NFT'))
  .then(() => nftDevNetXrplClient1.listNftSellOffers(tokenId))
  .then(logMessageAndPass('Listed sell offers for the NFT (should be 0)'))
  .then(() => nftDevNetXrplClient2.viewOwnNfts())
  .then(logMessageAndPass('List NFTs on the Client2 wallet account response'));
