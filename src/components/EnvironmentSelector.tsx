import { useXrplClients } from '../contexts/XrplClientsContext';
import { Environment } from '../XrplSandbox/types';

export const EnvironmentSelector = () => {
  const { environment, setEnvironment } = useXrplClients();

  return (
    <select
      onChange={(event) => setEnvironment(event.target.value as Environment)}
      value={environment}
    >
      <option value={Environment.NFT_DEV_NET}>NFT DevNet</option>
      <option value={Environment.DEV_NET}>DevNet</option>
      <option value={Environment.TEST_NET}>TestNet</option>
    </select>
  );
};
