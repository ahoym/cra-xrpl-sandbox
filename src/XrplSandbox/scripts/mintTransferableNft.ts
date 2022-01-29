import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../createClients';

/**
 * See @link to get credentials from the NFT-Devnet XRP faucet.
 * > Generate NFT-Devnet credentials > Copy "Secret" > Use as FAUCET_WALLET_SECRET
 *
 * {@link https://xrpl.org/xrp-testnet-faucet.html}
 */
const FAUCET_WALLET_SECRET = 'go-to-@link-above';

export const mintTransferableNftProcedure = nftDevNetXrplClient1
  .generateWallet(FAUCET_WALLET_SECRET)
  .then(logMessageAndPass('Created wallet on NFT-Devnet'))
  .then(() => nftDevNetXrplClient1.mintTransferableNft()) // Can pass options to method if desired
  .then(logMessageAndPass('Minted a transferable NFT'))
  .then(nftDevNetXrplClient1.viewOwnNfts)
  .then(logMessageAndPass('List NFTs on the wallet account response'));
