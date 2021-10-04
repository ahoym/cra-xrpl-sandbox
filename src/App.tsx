import './App.css';
import logo from './logo.svg';
import { xrplClient } from './XrplApiSandbox';

xrplClient
  .generateFaucetWallet()
  .then(xrplClient.logAndPass)
  .then(() => xrplClient.sendPayment(22, 'rUCzEr6jrEyMpjhs4wSdQdz4g8Y382NxfM'))
  .then(xrplClient.logAndPass);

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
