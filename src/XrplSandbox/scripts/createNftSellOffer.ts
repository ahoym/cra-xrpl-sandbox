import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';
import { NFT } from '../types';
import { mintTransferableNftProcedure } from './mintTransferableNft';

/**
 * See ./mintTransferableNft.ts on how to instantiate a sandbox client from
 * Faucet generated wallet credentials.
 */

let tokenId: string;

mintTransferableNftProcedure
  .then((baseResponse: any) => baseResponse.result.account_nfts)
  .then(logMessageAndPass('See specific NFTs on wallet'))
  .then((nfts: NFT[]) => {
    tokenId = nfts[0].TokenID;
    return nfts[0].TokenID;
  })
  .then(logMessageAndPass('Selected first NFT'))
  .then(nftDevNetXrplClient1.listNftSellOffers)
  .then(logMessageAndPass('Listed sell offers for the NFT'))
  .then(() => nftDevNetXrplClient1.createNftSellOffer({ amount: 22, tokenId }))
  .then(logMessageAndPass('Created sell offer for NFT'))
  .then(() => nftDevNetXrplClient1.listNftSellOffers(tokenId))
  .then(logMessageAndPass('Listed sell offers for the NFT'));
