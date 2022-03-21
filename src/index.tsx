import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { XrplClientsProvider } from './contexts/XrplClientsContext';
import './index.css';

ReactDOM.render(
  <React.StrictMode>
    <XrplClientsProvider>
      <App />
    </XrplClientsProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
