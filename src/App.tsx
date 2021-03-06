import { useEffect, useState } from 'react';
import './App.css';
import { EnvironmentSelector } from './components/EnvironmentSelector';
import { XrplClientGenerator } from './components/XrplClientGenerator';
import { XrplClientsList } from './components/XrplClientsList';
import { xrplClient1, xrplClient2 } from './XrplSandbox/createClients';

// Can import and run TS scripts this way if so desired
// import './XrplSandbox/scripts/sendXrpPayment';

// NFT Related
// import './XrplSandbox/scripts/mintTransferableNft';
// import './XrplSandbox/scripts/burnNft';
// import './XrplSandbox/scripts/createNftSellOffer';
// import './XrplSandbox/scripts/createNftBuyOffer';
// import './XrplSandbox/scripts/cancelNftSellOffer';
// import './XrplSandbox/scripts/cancelNftBuyOffer';
// import './XrplSandbox/scripts/acceptNftSellOffer';

// DEX Related
// import './XrplSandbox/scripts/issueCurrency';
// import './XrplSandbox/scripts/createOffer';

// Generate testnet wallets
const generateWalletRequestOne = xrplClient1.generateWallet();
const generateWalletRequestTwo = xrplClient2.generateWallet();

function App() {
  const [logs, setLogs] = useState<unknown[]>([]);

  useEffect(() => {
    generateWalletRequestOne.then((result) => {
      setLogs((logState) => [
        result,
        'Created faucet wallet for Client 1',
        ...logState,
      ]);
    });
  }, []);

  useEffect(() => {
    generateWalletRequestTwo.then((result) => {
      setLogs((logState) => [
        result,
        'Created faucet wallet for Client 2',
        ...logState,
      ]);
    });
  }, []);

  useEffect(() => {
    // After testnet wallet creations, send a 22 XRP payment
    Promise.all([generateWalletRequestOne, generateWalletRequestTwo])
      .then(() => xrplClient1.sendPayment(22, xrplClient2.wallet()!.address!))
      .then((result) => {
        setLogs((logState) => [
          result,
          'Sent transaction from Wallet 1 to Wallet 2',
          ...logState,
        ]);
      });
  }, []);

  return (
    <div className="App">
      <EnvironmentSelector />

      <header className="App-header">
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className="App-link"
          href="https://testnet.xrpl.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          XRPL Testnet Explorer
        </a>

        <XrplClientGenerator />

        <XrplClientsList />

        <p>
          Open the web console and access the two autogenerated testnet clients
          through <code>window.xrplClient1</code> and{' '}
          <code>window.xrplClient2</code>.
        </p>
        <p>
          See wallet information through:{' '}
          <code>window.xrplClient1.wallet()</code>
        </p>
        <p>
          Access the xrpl client through:{' '}
          <code>window.xrplClient1.client()</code>
        </p>

        <div className="App-logs">
          {logs.map((log) => {
            if (typeof log === 'string') {
              return (
                <p key={Math.random()} className="App-console-log">
                  {log}
                </p>
              );
            } else if (typeof log === 'object') {
              return (
                <div key={Math.random()}>
                  <pre>{JSON.stringify(log, null, 2)}</pre>
                </div>
              );
            }
            return null;
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
