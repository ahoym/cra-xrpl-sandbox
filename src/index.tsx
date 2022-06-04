import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { XrplClientsProvider } from './contexts/XrplClientsContext';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <XrplClientsProvider>
      <App />
    </XrplClientsProvider>
  </React.StrictMode>
);
