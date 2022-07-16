import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';
import { NFT } from '../types';
import { mintTransferableNftProcedure } from './mintTransferableNft';

console.log('🪙 Starting burnNft script 🪙');

/**
 * See ./mintTransferableNft on how to instantiate a sandbox client from
 * Faucet generated wallet credentials.
 */
mintTransferableNftProcedure
  .then((baseResponse: any) => baseResponse.result.account_nfts)
  .then(logMessageAndPass('See specific NFTs on wallet'))
  .then((nfts: NFT[]) => nfts[0].NFTokenID)
  .then(logMessageAndPass('Selecting first NFT and burning it'))
  .then(nftDevNetXrplClient1.burnNft)
  .then(logMessageAndPass('NFT burnt!'))
  .then(nftDevNetXrplClient1.viewOwnNfts)
  .then(logMessageAndPass('List NFTs on the wallet account response'))
  .finally(() => console.log('🪙 Finished the burnNft script 🪙'));
