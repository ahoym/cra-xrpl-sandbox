import './App.css';
import logo from './logo.svg';
import { generateTestnetXrplClient, xrplClient } from './XrplApiSandbox';
import { logMessageAndPass } from './XrplApiSandbox/utilities';

const clientOne = xrplClient;
const clientTwo = generateTestnetXrplClient();

const generateWalletRequestOne = clientOne
  .generateFaucetWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 1'));

const generateWalletRequestTwo = clientTwo
  .generateFaucetWallet()
  .then(logMessageAndPass('Created faucet wallet for Client 2'));

Promise.all([generateWalletRequestOne, generateWalletRequestTwo])
  .then(() => clientOne.sendPayment(22, clientTwo.wallet()?.account.address!))
  .then(logMessageAndPass('Sent transaction from Wallet 1 to Wallet 2'));

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
