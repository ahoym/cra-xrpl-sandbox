import { Wallet } from 'xrpl';
import { TEST_NET_EXPLORER } from '../constants';
import { XrplClient } from '../XrplClient';

// Only applicable to DEV/TEST net accounts.
export function generateWallet(
  xrplClient: XrplClient,
  {
    clientDescription,
    fromSeed,
  }: {
    clientDescription: string;
    fromSeed?: string;
  } = {
    clientDescription: 'Client',
  }
): Promise<Wallet> {
  return xrplClient.generateWallet(fromSeed).then((response: any) => {
    console.log('=========');
    console.log(
      `Created faucet wallet for ${clientDescription}. See TestNet explorer: ${TEST_NET_EXPLORER}accounts/${response.address}`
    );
    console.log('=========');

    return response;
  });
}
