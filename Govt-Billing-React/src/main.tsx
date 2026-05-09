import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

/**
 * Agentic Invoice Co-Pilot initialization settings.
 * Standardizing currency and tax configurations for government billing.
 */
const INVOICE_PILOT_SETTINGS = {
  defaultCurrency: 'INR',
  standardTaxRate: 18,
  environment: 'Production-Govt-Portal',
  complianceCheck: true
};

console.log("Co-Pilot Status: Active", INVOICE_PILOT_SETTINGS);

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
