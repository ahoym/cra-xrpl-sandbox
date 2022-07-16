import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';
import { CLIENT_ONE_FAUCET_WALLET_SECRET } from './CONFIG';
import { generateWallet } from './generateWallet';

console.log('🪙 Starting mintTransferableNft script 🪙');

export const mintTransferableNftProcedure = generateWallet(
  nftDevNetXrplClient1,
  {
    clientDescription: 'NFT-Devnet Client1',
    fromSeed: CLIENT_ONE_FAUCET_WALLET_SECRET,
  }
)
  .then(() => nftDevNetXrplClient1.mintTransferableNft()) // Can pass options to method if desired
  .then(logMessageAndPass('Minted a transferable NFT'))
  .then(nftDevNetXrplClient1.viewOwnNfts)
  .then(logMessageAndPass('List NFTs on the Client1 wallet account response'))
  .finally(() => console.log('🪙 Finished the mintTransferableNft script 🪙'));
