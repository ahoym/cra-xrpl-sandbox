import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1 } from '../index';

/**
 * See @link to get credentials from the NFT-Devnet XRP faucet.
 * > Generate NFT-Devnet credentials > Copy "Secret" > Use as FAUCET_WALLET_SECRET
 *
 * {@link https://xrpl.org/xrp-testnet-faucet.html}
 */
const FAUCET_WALLET_SECRET = 'spx576S1tX8kgu2x6YkLnudrEXnDY';
// const FAUCET_WALLET_SECRET = 'go-to-@link-above';

nftDevNetXrplClient1
  .generateWallet(FAUCET_WALLET_SECRET)
  .then(logMessageAndPass('Created wallet on NFT-Devnet'))
  .then(() => nftDevNetXrplClient1.mintTransferableNft())
  .then(logMessageAndPass('Minted a transferable NFT'))
  .then(() => nftDevNetXrplClient1.viewOwnNfts())
  .then(logMessageAndPass('Listed NFTs on the wallet account'));
