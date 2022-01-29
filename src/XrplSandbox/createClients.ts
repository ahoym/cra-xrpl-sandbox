import { NFT_DEV_NET, TEST_NET } from './constants';
import { XrplClient } from './XrplClient';

/**
 * Does not require manually generated credentials from the XRP Faucet.
 * The XrplClient can automagically generate them.
 *
 * @returns XrplClient wrapper around the xrpl.Client
 */
export function generateTestnetXrplClient() {
  return new XrplClient(TEST_NET);
}

/**
 * See @link to get credentials from the NFT-Devnet XRP faucet.
 * > Generate NFT-Devnet credentials > Copy "Secret" > nftDevNetXrplClient1.generateWallet("Secret");
 *
 * {@link https://xrpl.org/xrp-testnet-faucet.html}
 * @returns XrplClient wrapper around the xrpl.Client
 */
export function generateNftDevnetXrplClient() {
  return new XrplClient(NFT_DEV_NET);
}

export const xrplClient1 = generateTestnetXrplClient();
export const xrplClient2 = generateTestnetXrplClient();

export const nftDevNetXrplClient1 = generateNftDevnetXrplClient();
export const nftDevNetXrplClient2 = generateNftDevnetXrplClient();

/**
 * Place testnet clients on window so they can be experimented with
 * in the web console.
 */
(window as any).xrplClient1 = xrplClient1;
(window as any).xrplClient2 = xrplClient2;
(window as any).nftDevNetXrplClient1 = nftDevNetXrplClient1;
(window as any).nftDevNetXrplClient2 = nftDevNetXrplClient2;
