import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Environment } from '../XrplSandbox/types';
import { XrplClient } from '../XrplSandbox/XrplClient';

type XrplClientsMap = {
  [address: string]: XrplClient;
};

interface XrplClientsContextProps {
  environment: Environment;
  setEnvironment: (environment: Environment) => void;
  setXrplClient: (client: XrplClient) => Promise<void>;
  xrplClients: XrplClientsMap;
}

const DEFAULT_CONTEXT_PROPS = {
  environment: Environment.NFT_DEV_NET,
  setEnvironment: () => undefined,
  setXrplClient: async () => undefined,
  xrplClients: {},
};

const XrplClientsContext = createContext<XrplClientsContextProps>(
  DEFAULT_CONTEXT_PROPS
);

export const useXrplClients = () => useContext(XrplClientsContext);

export const XrplClientsProvider = ({ children }: { children: ReactNode }) => {
  const [xrplClients, setXrplClients] = useState<XrplClientsMap>(
    DEFAULT_CONTEXT_PROPS.xrplClients
  );
  const [environment, setEnvironment] = useState<Environment>(
    DEFAULT_CONTEXT_PROPS.environment
  );

  const setAllXrplClients = useCallback(
    (address: string, client: XrplClient) => {
      setXrplClients((state) => ({ ...state, [address]: client }));
    },
    [setXrplClients]
  );
  const setXrplClient = useCallback(
    async (client: XrplClient) => {
      const wallet = await client.connectAndGetWallet();
      setAllXrplClients(wallet.address, client);
    },
    [setAllXrplClients]
  );

  const clearClientsAndSetEnvironment = useCallback(
    (environment: Environment) => {
      setEnvironment(environment);
      // For most use cases, devs probably wont be swapping between networks.
      // If this becomes more of a thing, add an export function or retain
      // clients per env in state.
      setXrplClients(DEFAULT_CONTEXT_PROPS.xrplClients);
    },
    [setXrplClients]
  );

  return (
    <XrplClientsContext.Provider
      value={{
        environment,
        setEnvironment: clearClientsAndSetEnvironment,
        setXrplClient,
        xrplClients,
      }}
    >
      {children}
    </XrplClientsContext.Provider>
  );
};
