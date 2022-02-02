import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';
import { CLIENT_ONE_FAUCET_WALLET_SECRET } from './CONFIG';

console.log('🪙 Starting mintTransferableNft script 🪙');

export const mintTransferableNftProcedure = nftDevNetXrplClient1
  .generateWallet(CLIENT_ONE_FAUCET_WALLET_SECRET)
  .then(logMessageAndPass('Created Client1 wallet on NFT-Devnet'))
  .then(() => nftDevNetXrplClient1.mintTransferableNft()) // Can pass options to method if desired
  .then(logMessageAndPass('Minted a transferable NFT'))
  .then(nftDevNetXrplClient1.viewOwnNfts)
  .then(logMessageAndPass('List NFTs on the Client1 wallet account response'))
  .finally(() => console.log('🪙 Finished the mintTransferableNft script 🪙'));
