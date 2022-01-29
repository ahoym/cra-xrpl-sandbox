import { NFTokenMintFlags } from 'xrpl';

// Doesn't seem to be a general NFT interface in xrpl.js yet
export interface NFT {
  Flags: NFTokenMintFlags;
  Issuer: string;
  TokenID: string;
  TokenTaxon: number;
  nft_serial: number;
}
