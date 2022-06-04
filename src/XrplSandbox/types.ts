import { Client, NFTokenMintFlags, Wallet } from 'xrpl';

// Doesn't seem to be a general NFT interface in xrpl.js yet
export interface NFT {
  Flags: NFTokenMintFlags;
  Issuer: string;
  NFTokenID: string;
  NFTokenTaxon: number;
  nft_serial: number;
}

/** Properties provided by the sandbox XrplClient */
export interface StateRefs {
  wallet: Wallet;
  client: Client;
}

/**
 * Async data provider for properties provided by the sandbox XrplClient.
 * Allows for functions to be agnostic of where wallet and client data comes from.
 */
export type StateRefProvider = () => Promise<StateRefs>;

export enum Environment {
  TEST_NET = 'TEST_NET',
  DEV_NET = 'DEV_NET',
  NFT_DEV_NET = 'NFT_DEV_NET',
}
