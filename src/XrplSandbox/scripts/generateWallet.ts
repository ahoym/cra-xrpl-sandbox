import { Wallet } from 'xrpl';
import { TEST_NET_EXPLORER } from '../constants';
import { generateXrplClient, Network } from '../createClients';
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

export async function generateClientAndWalletFromSeed(
  {
    clientDescription,
    fromSeed,
    network,
    xrplClient,
  }: {
    clientDescription: string;
    xrplClient?: XrplClient;
    fromSeed?: string;
    network?: Network;
  } = {
    clientDescription: 'Client',
    network: Network.TEST_NET,
  }
): Promise<XrplClient> {
  const actualXrplClient = xrplClient || generateXrplClient(network);
  await generateWallet(actualXrplClient, {
    clientDescription,
    fromSeed,
  });
  return actualXrplClient;
}
