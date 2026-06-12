import React, { useState, useRef, useEffect } from "react";
import {
  IonContent,
  IonPage,
  IonToast,
  IonModal,
  IonButton,
} from "@ionic/react";
import SignatureCanvas from "react-signature-canvas";
import { Meshkit } from "../meshkit/Meshkit";
import { useInvoice } from "../contexts/InvoiceContext";
import { useHistory } from "react-router-dom";
import { getInvoiceFormat, setInvoiceFormat, getSequentialNumber, setSequentialNumber, getIpfsSettings, saveIpfsSettings } from "../utils/settings";
// import { ipfsService } from "../services/ipfs-service";
import "./SettingsPage.css";

// Custom SVG Icons
const InvoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const FormatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#374151' }}>
    <polyline points="4 7 4 4 20 4 20 7" />
    <line x1="9" y1="20" x2="15" y2="20" />
    <line x1="12" y1="4" x2="12" y2="20" />
  </svg>
);

const NumberIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#374151' }}>
    <line x1="10" y1="9" x2="8" y2="9" />
    <line x1="8" y1="15" x2="10" y2="15" />
    <path d="M16 15h-2v-6h2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);

const ResetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e0b' }}>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const CurrencyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#374151' }}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <path d="M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
  </svg>
);

const SettingsGearIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3b82f6' }}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.18-.08a2 2 0 0 0-2.5.86l-.22.38a2 2 0 0 0 .54 2.64l.15.13a2 2 0 0 1 .81 1.73v.51a2 2 0 0 1-.81 1.73l-.15.13a2 2 0 0 0-.54 2.64l.22.38a2 2 0 0 0 2.5.86l.18-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.18.08a2 2 0 0 0 2.5-.86l.22-.38a2 2 0 0 0-.54-2.64l-.15-.13a2 2 0 0 1-.81-1.73v-.51a2 2 0 0 1 .81-1.73l.15-.13a2 2 0 0 0 .54-2.64l-.22-.38a2 2 0 0 0-2.5-.86l-.18.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PreviewIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#374151' }}>
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const SignatureIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e0b' }}>
    <path d="M3 17c3-3 5 2 8 0s5-5 8-2" />
    <line x1="3" y1="21" x2="21" y2="21" />
  </svg>
);


const LogoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const CloudIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
    <path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.78-3.5-3.5-3.5a5.5 5.5 0 0 0-5.5 5.5c-1.4 0-3 1.05-3 2.5a3.5 3.5 0 0 0 3.5 3.5h12.5z" />
  </svg>
);

// Toggle Switch Component
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <button
    className={`settings-toggle ${checked ? 'active' : ''}`}
    onClick={() => onChange(!checked)}
    role="switch"
    aria-checked={checked}
  >
    <span className="settings-toggle-track">
      <span className="settings-toggle-thumb" />
    </span>
  </button>
);

// Select Component
const Select = ({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[]
}) => (
  <select
    className="settings-select"
    value={value}
    onChange={(e) => onChange(e.target.value)}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

interface SavedItem {
  id: string;
  data: string;
  name: string;
}

const SettingsPage: React.FC = () => {
  const history = useHistory();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Invoice settings state
  const { currency, updateCurrency } = useInvoice();

  const [invoiceFormat, setInvoiceFormatState] = useState(getInvoiceFormat());
  const [startingNumber, setStartingNumber] = useState(getSequentialNumber().toString());
  // const [resetFrequency, setResetFrequency] = useState("never"); // Not implemented yet

  // IPFS credentials state
  const [ipfsPinataJwt, setIpfsPinataJwt] = useState("");
  const [ipfsPinataApiKey, setIpfsPinataApiKey] = useState("");
  const [ipfsPinataApiSecret, setIpfsPinataApiSecret] = useState("");
  const [ipfsGatewayUrl, setIpfsGatewayUrl] = useState("https://gateway.pinata.cloud/ipfs/");
  const [testingConnection, setTestingConnection] = useState(false);

  const handleInvoiceFormatChange = (format: string) => {
    setInvoiceFormatState(format as any);
    setInvoiceFormat(format as any);
  }

  const handleStartingNumberUpdate = () => {
    const num = parseInt(startingNumber);
    if (!isNaN(num)) {
      setSequentialNumber(num);
      setToastMessage("Starting number updated");
      setShowToast(true);
    }
  }

  // Load saved signatures, logos, and IPFS settings from localStorage
  useEffect(() => {
    const ipfs = getIpfsSettings();
    setIpfsPinataJwt(ipfs.ipfsPinataJwt);
    setIpfsPinataApiKey(ipfs.ipfsPinataApiKey);
    setIpfsPinataApiSecret(ipfs.ipfsPinataApiSecret);
    setIpfsGatewayUrl(ipfs.ipfsGatewayUrl);
  }, []);

  const handleSaveIpfsSettings = () => {
    saveIpfsSettings({
      ipfsPinataJwt,
      ipfsPinataApiKey,
      ipfsPinataApiSecret,
      ipfsGatewayUrl
    });
    setToastMessage("IPFS credentials saved successfully!");
    setShowToast(true);
  };

  const handleTestIpfsConnection = async () => {
    if (!ipfsPinataJwt.trim() && (!ipfsPinataApiKey.trim() || !ipfsPinataApiSecret.trim())) {
      setToastMessage("Please enter Pinata JWT or API Key + Secret first.");
      setShowToast(true);
      return;
    }
    setTestingConnection(true);
    try {
      const mk = await Meshkit.init({
        provider: "pinata",
        providerToken: ipfsPinataJwt,
      });

      const result = await mk.store({
        hello: "world",
      });
      console.log("STORE RESULT", result);

      const ok = await mk.testConnection();

      if (ok) {
        setToastMessage("Successfully connected to Pinata!");
      } else {
        setToastMessage("Could not connect to Pinata. Check credentials.");
      }
    } catch (e: any) {
      setToastMessage(`Connection failed: ${e.message || e}`);
    } finally {
      setTestingConnection(false);
      setShowToast(true);
    }
  };

  const handleCurrencyChange = (newCurrency: string) => {
    updateCurrency(newCurrency);
    // setDefaultCurrency(newCurrency); // Handled by context now
    setToastMessage("Currency updated");
    setShowToast(true);
  };



  const getPreviewText = () => {
    const date = new Date();
    // const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    // const timestamp = Math.floor(date.getTime() / 1000);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    switch (invoiceFormat) {
      case "invoice-date-timestamp":
        return `INV-${Date.now()}`;
      case "unique-id":
        return `INV-${crypto.randomUUID?.()?.slice(0, 8) || 'a1b2c3d4'}`;
      case "sequential":
        return `INV-${String(parseInt(startingNumber) || 1).padStart(5, '0')}`;
      default:
        return `INV-${hh}${mm}${ss}`;
    }
  };

  // Signature handlers


  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="settings-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', paddingTop: '24px' }}>

          {/* Invoice Number Section */}
          <section className="settings-section">
            <div className="settings-section-header">
              <div style={{ color: '#6366f1' }}><InvoiceIcon /></div>
              <h2>Invoice Number</h2>
            </div>

            <div className="settings-card">


              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}><FormatIcon /></div>
                  <div className="settings-row-content">
                    <span className="settings-label">Format</span>
                  </div>
                </div>
                <Select
                  value={invoiceFormat}
                  onChange={handleInvoiceFormatChange}
                  options={[
                    { value: "invoice-date-timestamp", label: "INV-TIMESTAMP" },
                    { value: "unique-id", label: "Unique Identifier" },
                    { value: "sequential", label: "Sequential Number" },
                  ]}
                />
              </div>

              {invoiceFormat === "sequential" && (
                <>
                  <div className="settings-row">
                    <div className="settings-row-left">
                      <div className="settings-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}><NumberIcon /></div>
                      <div className="settings-row-content">
                        <span className="settings-label">Starting Number</span>
                        <span className="settings-sublabel">First number for sequential format</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        value={startingNumber}
                        onChange={(e) => setStartingNumber(e.target.value)}
                        className="settings-number-input"
                        style={{ width: '80px' }}
                      />
                      <IonButton
                        size="small"
                        fill="outline"
                        onClick={handleStartingNumberUpdate}
                      >
                        Update
                      </IonButton>
                    </div>
                  </div>
                </>
              )}

              <div className="settings-preview">
                <div className="settings-preview-icon"><PreviewIcon /></div>
                <div className="settings-preview-content">
                  <span className="settings-preview-label">Preview</span>
                  <span className="settings-preview-value">{getPreviewText()}</span>
                </div>
              </div>
            </div>
          </section>

          {/* General Settings Section */}
          <section className="settings-section">
            <div className="settings-section-header">
              <div style={{ color: '#64748b' }}><SettingsGearIcon /></div>
              <h2>General Settings</h2>
            </div>

            <div className="settings-card">
              <div className="settings-row">
                <div className="settings-row-left">
                  <div className="settings-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}><CurrencyIcon /></div>
                  <div className="settings-row-content">
                    <span className="settings-label">Default Currency</span>
                  </div>
                </div>
                <Select
                  value={currency}
                  onChange={handleCurrencyChange}
                  options={[
                    { value: "USD", label: "USD ($)" },
                    { value: "EUR", label: "EUR (€)" },
                    { value: "GBP", label: "GBP (£)" },
                    { value: "INR", label: "INR (₹)" },
                    { value: "AUD", label: "AUD (A$)" },
                    { value: "CAD", label: "CAD (C$)" },
                    { value: "JPY", label: "JPY (¥)" },
                  ]}
                />
              </div>

            </div>
          </section>

          {/* IPFS Settings Section */}
          <section className="settings-section">
            <div className="settings-section-header">
              <div style={{ color: '#10b981' }}><CloudIcon /></div>
              <h2>IPFS (Decentralized Cloud) Settings</h2>
            </div>

            <div className="settings-card" style={{ padding: '8px 0' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--settings-border)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="settings-label" style={{ fontWeight: '600' }}>Credentials Configuration</span>
                <span className="settings-sublabel">Enter your Pinata credentials to enable saving and retrieving invoices on the decentralized web.</span>
              </div>
              
              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', borderBottom: '1px solid var(--settings-border)' }}>
                <span className="settings-label">Pinata JWT Token (Recommended)</span>
                <textarea
                  placeholder="Paste your Pinata JWT token here..."
                  value={ipfsPinataJwt}
                  onChange={(e) => setIpfsPinataJwt(e.target.value)}
                  style={{ width: '100%', minHeight: '80px', borderRadius: '8px', border: '1px solid var(--settings-border)', padding: '8px 12px', fontSize: '13px', fontFamily: 'monospace', resize: 'vertical' }}
                />
              </div>

              <div style={{ padding: '8px 20px', background: '#f8fafc', borderBottom: '1px solid var(--settings-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', letterSpacing: '0.1em' }}>— OR —</span>
              </div>

              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', borderBottom: '1px solid var(--settings-border)' }}>
                <span className="settings-label">Pinata API Key</span>
                <input
                  type="text"
                  placeholder="Enter Pinata API Key..."
                  value={ipfsPinataApiKey}
                  onChange={(e) => setIpfsPinataApiKey(e.target.value)}
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--settings-border)', padding: '8px 12px', fontSize: '13px' }}
                />
              </div>

              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', borderBottom: '1px solid var(--settings-border)' }}>
                <span className="settings-label">Pinata API Secret</span>
                <input
                  type="password"
                  placeholder="Enter Pinata API Secret..."
                  value={ipfsPinataApiSecret}
                  onChange={(e) => setIpfsPinataApiSecret(e.target.value)}
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--settings-border)', padding: '8px 12px', fontSize: '13px' }}
                />
              </div>

              <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px', borderBottom: '1px solid var(--settings-border)' }}>
                <span className="settings-label">IPFS Gateway URL</span>
                <input
                  type="text"
                  placeholder="e.g. https://gateway.pinata.cloud/ipfs/"
                  value={ipfsGatewayUrl}
                  onChange={(e) => setIpfsGatewayUrl(e.target.value)}
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid var(--settings-border)', padding: '8px 12px', fontSize: '13px' }}
                />
                <span className="settings-sublabel">Default: https://gateway.pinata.cloud/ipfs/. Set custom gateway to retrieve faster.</span>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', gap: '12px', justifyContent: 'flex-end', background: '#f8fafc' }}>
                <IonButton
                  size="small"
                  fill="outline"
                  color="medium"
                  onClick={handleTestIpfsConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? 'Testing...' : 'Test Connection'}
                </IonButton>
                <IonButton
                  size="small"
                  fill="solid"
                  color="primary"
                  onClick={handleSaveIpfsSettings}
                >
                  Save Credentials
                </IonButton>
              </div>
            </div>
          </section>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default SettingsPage;

