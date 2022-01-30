import { logMessageAndPass } from '../../utilities';
import { nftDevNetXrplClient1, nftDevNetXrplClient2 } from '../createClients';
import { NFT } from '../types';
import { mintTransferableNftProcedure } from './mintTransferableNft';

let tokenId: string;

const mintTokenFromClient1 = mintTransferableNftProcedure
  .then((baseResponse: any) => baseResponse.result.account_nfts)
  .then(logMessageAndPass('See specific NFTs on the Client1 wallet'))
  .then((nfts: NFT[]) => {
    tokenId = nfts[0].TokenID;
    return nfts[0].TokenID;
  })
  .then(logMessageAndPass('Selected first NFT from Client1 wallet'))
  .then(() => nftDevNetXrplClient1.listNftBuyOffers(tokenId))
  .then(logMessageAndPass('Listed buy offers for the NFT'));

/**
 * See @link to get credentials from the NFT-Devnet XRP faucet.
 * > Generate NFT-Devnet credentials > Copy "Secret" > Use as FAUCET_WALLET_SECRET
 *
 * {@link https://xrpl.org/xrp-testnet-faucet.html}
 */
const FAUCET_WALLET_SECRET = 'go-to-@link-above';

const generateWalletForClient2 = nftDevNetXrplClient2
  .generateWallet(FAUCET_WALLET_SECRET)
  .then(logMessageAndPass('Created Client2 wallet on NFT-Devnet'));

Promise.all([mintTokenFromClient1, generateWalletForClient2])
  .then(() => nftDevNetXrplClient2.listNftBuyOffers(tokenId))
  .then(logMessageAndPass('Listed buy offers for the NFT'))
  .then(() =>
    nftDevNetXrplClient2.createNftBuyOffer({
      amount: 22,
      tokenId,
      owner: nftDevNetXrplClient1.wallet()?.address!,
    })
  )
  .then(logMessageAndPass('Created buy offer for NFT'))
  .then(() => nftDevNetXrplClient2.listNftBuyOffers(tokenId))
  .then(logMessageAndPass('Listed buy offers for the NFT'));
