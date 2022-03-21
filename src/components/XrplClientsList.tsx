import { useXrplClients } from '../contexts/XrplClientsContext';

export const XrplClientsList = () => {
  const { xrplClients } = useXrplClients();

  return (
    <>
      {Object.keys(xrplClients).map((clientAddress) => (
        <p key={clientAddress}>{clientAddress}</p>
      ))}
    </>
  );
};
