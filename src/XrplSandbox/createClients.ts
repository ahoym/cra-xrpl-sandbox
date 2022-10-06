import {
  DEV_NET,
  DEV_NET_EXPLORER,
  NFT_DEV_NET,
  NFT_DEV_NET_EXPLORER,
  TEST_NET,
  TEST_NET_EXPLORER,
} from './constants';
import { XrplClient } from './XrplClient';

function listExplorers() {
  console.log('Testnet: ', TEST_NET_EXPLORER);
  console.log('Nft-Devnet: ', NFT_DEV_NET_EXPLORER);
  console.log('Devnet: ', DEV_NET_EXPLORER);
}

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
 * Does not require manually generated credentials from the XRP Faucet.
 * The XrplClient can automagically generate them.
 *
 * @returns XrplClient wrapper around the xrpl.Client
 */
export function generateDevNetXrplClient() {
  return new XrplClient(DEV_NET);
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

export enum Network {
  TEST_NET = 'TEST_NET',
  DEV_NET = 'DEV_NET',
}
const NETWORK_MAP = {
  [Network.DEV_NET]: DEV_NET,
  [Network.TEST_NET]: TEST_NET,
};

export function generateXrplClient(network: Network = Network.TEST_NET) {
  return new XrplClient(NETWORK_MAP[network]);
}

export const xrplClient1 = generateTestnetXrplClient();
export const xrplClient2 = generateTestnetXrplClient();

export const xrplDevNetClient1 = generateDevNetXrplClient();
export const xrplDevNetClient2 = generateDevNetXrplClient();

export const nftDevNetXrplClient1 = generateNftDevnetXrplClient();
export const nftDevNetXrplClient2 = generateNftDevnetXrplClient();

console.log('🎉 Welcome! 🎉');
console.log('Access any of the following clients in the web console:');
const CLIENTS = {
  xrplClient1: {
    network: 'TEST_NET',
    explorer: TEST_NET_EXPLORER,
  },
  xrplClient2: {
    network: 'TEST_NET',
    explorer: TEST_NET_EXPLORER,
  },
  nftDevNetXrplClient1: {
    network: 'NFT_DEV_NET',
    explorer: NFT_DEV_NET_EXPLORER,
  },
  nftDevNetXrplClient2: {
    network: 'NFT_DEV_NET',
    explorer: NFT_DEV_NET_EXPLORER,
  },
};
console.table(CLIENTS);
console.log(
  'Run the listExplorers() function to list out links to all xrpl subnet explorers'
);
listExplorers();
console.log(
  'For NFT-Devnet Credentials, see: ',
  'https://xrpl.org/xrp-testnet-faucet.html'
);
console.log(
  'See the XRP Testnet and Devnet faucets here: https://xrpl.org/xrp-testnet-faucet.html'
);

console.log('🤖 💻 Happy sandboxing! 🖥️ 🤖');

/**
 * Place testnet clients on window so they can be experimented with
 * in the web console.
 */
(window as any).xrplClient1 = xrplClient1;
(window as any).xrplClient2 = xrplClient2;
(window as any).xrplDevNetClient1 = xrplDevNetClient1;
(window as any).xrplDevNetClient2 = xrplDevNetClient2;
(window as any).nftDevNetXrplClient1 = nftDevNetXrplClient1;
(window as any).nftDevNetXrplClient2 = nftDevNetXrplClient2;

(window as any).generateDevNetXrplClient = generateDevNetXrplClient;
(window as any).generateTestnetXrplClient = generateTestnetXrplClient;
(window as any).listExplorers = listExplorers;
