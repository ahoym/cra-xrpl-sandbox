import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1, nftDevNetXrplClient2 } from '../createClients';
import { NFT } from '../types';
import { CLIENT_TWO_FAUCET_WALLET_SECRET } from './CONFIG';
import { mintTransferableNftProcedure } from './mintTransferableNft';

console.log('🪙 Starting createNftBuyOffer script 🪙');

const RANDOM_XRP_VALUE = Math.round(Math.random() * 100);
let tokenId: string;

const mintTokenFromClient1 = mintTransferableNftProcedure
  .then((baseResponse: any) => baseResponse.result.account_nfts)
  .then(logMessageAndPass('See specific NFTs on the Client1 wallet'))
  .then((nfts: NFT[]) => {
    tokenId = nfts[0].NFTokenID;
    return nfts[0].NFTokenID;
  })
  .then(logMessageAndPass('Selected first NFT from Client1 wallet'))
  .then(() => nftDevNetXrplClient1.listNftBuyOffers(tokenId))
  .then(logMessageAndPass('Listed buy offers for the NFT'));

const generateWalletForClient2 = nftDevNetXrplClient2
  .generateWallet(CLIENT_TWO_FAUCET_WALLET_SECRET)
  .then(logMessageAndPass('Created Client2 wallet on NFT-Devnet'));

export const mintNftAndCreateBidProcedure = Promise.all([
  mintTokenFromClient1,
  generateWalletForClient2,
])
  .then(() =>
    nftDevNetXrplClient2.createNftBuyOffer({
      amount: RANDOM_XRP_VALUE,
      tokenId,
      owner: nftDevNetXrplClient1.wallet()?.address!,
    })
  )
  .then(
    logMessageAndPass(`Created buy offer for NFT for ${RANDOM_XRP_VALUE} XRP`)
  )
  .then(() => nftDevNetXrplClient2.listNftBuyOffers(tokenId))
  .then(logMessageAndPass('Listed new buy offers for the NFT'))
  .finally(() => console.log('🪙 Finished the createNftBuyOffer script 🪙'));
