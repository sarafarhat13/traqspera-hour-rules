import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { defineCustomElements } from '@trimble-oss/moduswebcomponents/loader';
import '@trimble-oss/moduswebcomponents/modus-wc-styles.css';
import App from './App';
import './index.css';

// Register the Modus custom elements once during app bootstrap.
defineCustomElements();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* HashRouter keeps deep links working on GitHub Pages (no server rewrites needed). */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
