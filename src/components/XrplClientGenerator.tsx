import { useXrplClients } from '../contexts/XrplClientsContext';
import { DEV_NET, NFT_DEV_NET, TEST_NET } from '../XrplSandbox/constants';
import { Environment } from '../XrplSandbox/types';
import { XrplClient } from '../XrplSandbox/XrplClient';

const XRPL_NET_CONFIG = {
  [Environment.NFT_DEV_NET]: {
    server: NFT_DEV_NET,
  },
  [Environment.DEV_NET]: {
    server: DEV_NET,
  },
  [Environment.TEST_NET]: {
    server: TEST_NET,
  },
};

export const XrplClientGenerator = () => {
  const { environment, setXrplClient } = useXrplClients();

  if (environment === Environment.NFT_DEV_NET) {
    // TODO - return section on how to generate secret, add text input
    return null;
  }

  return (
    <button
      onClick={async () => {
        const xrplConfig = XRPL_NET_CONFIG[environment];
        const newClient = new XrplClient(xrplConfig.server);
        await newClient.generateWallet();
        setXrplClient(newClient);
      }}
    >
      Generate Client
    </button>
  );
};
