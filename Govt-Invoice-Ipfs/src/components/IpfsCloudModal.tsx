import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonToast,
  IonSpinner,
} from "@ionic/react";
import {
  closeOutline,
  cloudOutline,
  copyOutline,
  openOutline,
  trashOutline,
  keyOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  eyeOutline,
  eyeOffOutline,
} from "ionicons/icons";
import { getIpfsSettings, saveIpfsSettings } from "../utils/settings";
import { ipfsService } from "../services/ipfs-service";
import { localTemplateService } from "../services/local-template-service";
import { Meshkit } from "../meshkit/Meshkit";
import "./IpfsCloudModal.css";

interface IpfsCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (fileName: string) => void;
}

interface PinnedHistoryItem {
  cid: string;
  name: string;
  date?: string;
}

export const IpfsCloudModal: React.FC<IpfsCloudModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<"files" | "credentials">("files");

  // Credentials State
  const [ipfsPinataJwt, setIpfsPinataJwt] = useState("");
  const [ipfsPinataApiKey, setIpfsPinataApiKey] = useState("");
  const [ipfsPinataApiSecret, setIpfsPinataApiSecret] = useState("");
  const [ipfsGatewayUrl, setIpfsGatewayUrl] = useState("https://gateway.pinata.cloud/ipfs/");
  const [showJwt, setShowJwt] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  
  // Connection Test & Save State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "success" | "failed">("idle");
  const [testMessage, setTestMessage] = useState("");

  // Cloud Files State
  const [historyList, setHistoryList] = useState<PinnedHistoryItem[]>([]);
  const [importCid, setImportCid] = useState("");
  const [importing, setImporting] = useState(false);

  // Toast notifications
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<"success" | "warning" | "danger" | "primary">("primary");

  // Load configuration and history on open
  useEffect(() => {
    if (isOpen) {
      // Load credentials
      const ipfs = getIpfsSettings();
      setIpfsPinataJwt(ipfs.ipfsPinataJwt || "");
      setIpfsPinataApiKey(ipfs.ipfsPinataApiKey || "");
      setIpfsPinataApiSecret(ipfs.ipfsPinataApiSecret || "");
      setIpfsGatewayUrl(ipfs.ipfsGatewayUrl || "https://gateway.pinata.cloud/ipfs/");
      setTestResult("idle");
      setTestMessage("");

      // Load pinned history
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = () => {
    try {
      const historyStr = localStorage.getItem("ipfs_pinned_history") || "[]";
      const history: PinnedHistoryItem[] = JSON.parse(historyStr);
      // Sort: newest first if date exists
      setHistoryList(history);
    } catch (e) {
      console.warn("Failed to load IPFS history:", e);
      setHistoryList([]);
    }
  };

  const showToastNotification = (msg: string, color: "success" | "warning" | "danger" | "primary" = "primary") => {
    setToastMessage(msg);
    setToastColor(color);
    setShowToast(true);
  };

  // Credentials actions
  const handleSaveCredentials = () => {
    saveIpfsSettings({
      ipfsPinataJwt,
      ipfsPinataApiKey,
      ipfsPinataApiSecret,
      ipfsGatewayUrl,
    });
    showToastNotification("IPFS credentials saved successfully!", "success");
  };

  const handleTestConnection = async () => {
    if (!ipfsPinataJwt.trim() && (!ipfsPinataApiKey.trim() || !ipfsPinataApiSecret.trim())) {
      setTestResult("failed");
      setTestMessage("Please provide a JWT or API Key + API Secret.");
      return;
    }

    setTestingConnection(true);
    setTestResult("idle");
    setTestMessage("");

    try {
      const ok = await ipfsService.testConnection(
        ipfsPinataJwt,
        ipfsPinataApiKey,
        ipfsPinataApiSecret
      );
      if (ok) {
        setTestResult("success");
        setTestMessage("Connection to Pinata successful!");
      } else {
        setTestResult("failed");
        setTestMessage("Connection failed. Check your API credentials.");
      }
    } catch (e: any) {
      setTestResult("failed");
      setTestMessage(e.message || "Failed to authenticate with Pinata API.");
    } finally {
      setTestingConnection(false);
    }
  };

  // Load Action
  const handleLoadByCid = async (cidToImport: string) => {
    const cid = cidToImport.trim();
    if (!cid) {
      showToastNotification("Please enter a valid CID", "warning");
      return;
    }

    setImporting(true);
    showToastNotification("Fetching invoice from IPFS...", "primary");

    try {
      const mk = await Meshkit.init({
        provider: "pinata",
        providerToken: getIpfsSettings().ipfsPinataJwt,
      });

      const invoiceData = await mk.retrieve<any>(cid);

      // Save data directly to temporary localStorage key      localStorage.setItem("ipfs_temp_invoice_content", JSON.stringify(invoiceData));

      // Append/prepend to IPFS pinned history list if it's not already in there!
      const historyStr = localStorage.getItem("ipfs_pinned_history") || "[]";
      let history: PinnedHistoryItem[] = JSON.parse(historyStr);
      if (!history.some(item => item.cid === cid)) {
        history = [
          {
            cid,
            name: invoiceData.name || "Imported Invoice",
            date: new Date().toLocaleString(),
          },
          ...history,
        ];
        localStorage.setItem("ipfs_pinned_history", JSON.stringify(history));
      }

      showToastNotification(`Successfully loaded invoice from IPFS!`, "success");
      setImportCid("");
      
      // Force navigation to the editor page with "invoice" filename
      window.location.href = "/app/editor/invoice";

      onClose();
    } catch (e: any) {
      console.error("IPFS Load Error:", e);
      showToastNotification(`Load failed: ${e.message || "check CID/gateway configuration"}`, "danger");
    } finally {
      setImporting(false);
    }
  };

  // Helper actions for history items
  const handleCopyCid = (cid: string) => {
    navigator.clipboard.writeText(cid);
    showToastNotification("CID copied to clipboard!", "success");
  };

  const handleRemoveFromHistory = (cid: string) => {
    try {
      const updated = historyList.filter((item) => item.cid !== cid);
      localStorage.setItem("ipfs_pinned_history", JSON.stringify(updated));
      setHistoryList(updated);
      showToastNotification("Removed from local history list.", "primary");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="ipfs-cloud-modal"
      style={{
        "--height": "85vh",
        "--max-height": "750px",
        "--width": "100%",
        "--max-width": "540px",
        "--border-radius": "16px",
      }}
    >
      <IonHeader>
        <IonToolbar color="primary" style={{ "--padding-top": "12px", "--padding-bottom": "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "white" }}>
              <IonIcon icon={cloudOutline} style={{ fontSize: "24px" }} />
              <IonTitle style={{ fontWeight: 600, fontSize: "18px", padding: 0 }}>IPFS Cloud Manager</IonTitle>
            </div>
            <IonButton fill="clear" onClick={onClose} style={{ color: "white", margin: 0 }}>
              <IonIcon icon={closeOutline} slot="icon-only" style={{ fontSize: "24px" }} />
            </IonButton>
          </div>
        </IonToolbar>
        <IonToolbar style={{ "--min-height": "48px", background: "#f8fafc" }}>
          <IonSegment
            value={activeTab}
            onIonChange={(e) => setActiveTab(e.detail.value as "files" | "credentials")}
            style={{ padding: "4px 8px" }}
          >
            <IonSegmentButton value="files">
              <IonLabel style={{ fontWeight: "600", fontSize: "13px" }}>Cloud Files</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="credentials">
              <IonLabel style={{ fontWeight: "600", fontSize: "13px" }}>IPFS Credentials</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" style={{ "--background": "#ffffff" }}>
        {activeTab === "files" ? (
          /* ============================================================== */
          /* CLOUD FILES TAB                                                */
          /* ============================================================== */
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", height: "100%" }}>
            
            {/* Quick Load Section */}
            <div className="ipfs-dash-box">
              <h3 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                Load Invoice via CID
              </h3>
              <p style={{ margin: "0 0 12px 0", fontSize: "12px", color: "#64748b", lineHeight: "1.4" }}>
                Paste the Content Identifier (CID) of an invoice to retrieve and open it in the editor as a new unsaved file.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="Enter IPFS CID (e.g. Qm... or bafy...)"
                  value={importCid}
                  onChange={(e) => setImportCid(e.target.value)}
                  disabled={importing}
                  className="ipfs-modal-input"
                  style={{
                    flex: 1,
                    fontFamily: "monospace"
                  }}
                />
                <IonButton
                  size="small"
                  onClick={() => handleLoadByCid(importCid)}
                  disabled={importing || !importCid.trim()}
                  style={{ margin: 0, height: "36px", "--border-radius": "8px" }}
                >
                  {importing ? (
                    <IonSpinner name="crescent" style={{ width: "16px", height: "16px" }} />
                  ) : (
                    <>
                      <IonIcon icon={openOutline} slot="start" style={{ marginRight: "4px" }} />
                      Load
                    </>
                  )}
                </IonButton>
              </div>
            </div>

            {/* History List Header */}
            <div>
              <h3 style={{ margin: "0 0 12px 0", fontSize: "15px", fontWeight: "600", color: "#0f172a" }}>
                Cloud Backup History
              </h3>
              
              {historyList.length === 0 ? (
                /* Empty State */
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 16px",
                  textAlign: "center",
                  background: "#fdfdfd",
                  border: "1px solid #f1f5f9",
                  borderRadius: "12px",
                  marginTop: "8px"
                }}>
                  <div style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "#ecfdf5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "12px"
                  }}>
                    <IonIcon icon={cloudOutline} style={{ fontSize: "24px", color: "#10b981" }} />
                  </div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                    No Pinned Files
                  </h4>
                  <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>
                    Invoices you upload to IPFS will show up here for easy sharing and loading.
                  </p>
                </div>
              ) : (
                /* History List */
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  maxHeight: "380px",
                  overflowY: "auto",
                  paddingRight: "4px"
                }}>
                  {historyList.map((item, index) => (
                    <div
                      key={item.cid + index}
                      className="ipfs-history-card"
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div className="ipfs-history-title">
                            {item.name || "Unnamed Invoice"}
                          </div>
                          {item.date && (
                            <div style={{ fontSize: "10.5px", color: "#94a3b8", marginTop: "2px" }}>
                              Uploaded: {item.date}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            onClick={() => handleCopyCid(item.cid)}
                            title="Copy CID"
                            style={{
                              background: "#f1f5f9",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              color: "#475569"
                            }}
                          >
                            <IonIcon icon={copyOutline} style={{ fontSize: "14px" }} />
                          </button>
                          <button
                            onClick={() => handleLoadByCid(item.cid)}
                            title="Load in Editor"
                            style={{
                              background: "#e0f2fe",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              color: "#0369a1"
                            }}
                          >
                            <IonIcon icon={openOutline} style={{ fontSize: "14px" }} />
                          </button>
                          <button
                            onClick={() => handleRemoveFromHistory(item.cid)}
                            title="Remove from List"
                            style={{
                              background: "#fee2e2",
                              border: "none",
                              borderRadius: "6px",
                              padding: "6px 8px",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              color: "#b91c1c"
                            }}
                          >
                            <IonIcon icon={trashOutline} style={{ fontSize: "14px" }} />
                          </button>
                        </div>
                      </div>
                      <div className="ipfs-history-cid-box">
                        {item.cid}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          /* ============================================================== */
          /* IPFS CREDENTIALS TAB                                           */
          /* ============================================================== */
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            
            <div className="ipfs-info-card">
              <IonIcon icon={keyOutline} style={{ fontSize: "18px", flexShrink: 0, color: "#2563eb" }} />
              <div>
                Configure your Pinata credentials below to backup and retrieve your invoices on IPFS.
              </div>
            </div>

            {/* JWT Token input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>
                Pinata JWT Token (Recommended)
              </label>
              <div className="ipfs-input-wrapper">
                <input
                  type={showJwt ? "text" : "password"}
                  placeholder="Paste your Pinata JWT token..."
                  value={ipfsPinataJwt}
                  onChange={(e) => setIpfsPinataJwt(e.target.value)}
                  className="ipfs-modal-input ipfs-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowJwt(!showJwt)}
                  className="ipfs-input-toggle"
                  title={showJwt ? "Hide Token" : "Show Token"}
                >
                  <IonIcon icon={showJwt ? eyeOffOutline : eyeOutline} style={{ fontSize: "16px" }} />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "4px 0" }}>
              <span style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", letterSpacing: "0.1em" }}>
                — OR USE API KEY —
              </span>
            </div>

            {/* API Key */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Pinata API Key</label>
              <input
                type="text"
                placeholder="Enter Pinata API Key..."
                value={ipfsPinataApiKey}
                onChange={(e) => setIpfsPinataApiKey(e.target.value)}
                className="ipfs-modal-input"
              />
            </div>

            {/* API Secret */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>Pinata API Secret</label>
              <div className="ipfs-input-wrapper">
                <input
                  type={showApiSecret ? "text" : "password"}
                  placeholder="Enter Pinata API Secret..."
                  value={ipfsPinataApiSecret}
                  onChange={(e) => setIpfsPinataApiSecret(e.target.value)}
                  className="ipfs-modal-input ipfs-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowApiSecret(!showApiSecret)}
                  className="ipfs-input-toggle"
                  title={showApiSecret ? "Hide Secret" : "Show Secret"}
                >
                  <IonIcon icon={showApiSecret ? eyeOffOutline : eyeOutline} style={{ fontSize: "16px" }} />
                </button>
              </div>
            </div>

            {/* Gateway URL */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "13px", fontWeight: "600", color: "#475569" }}>IPFS Gateway URL</label>
              <input
                type="text"
                placeholder="https://gateway.pinata.cloud/ipfs/"
                value={ipfsGatewayUrl}
                onChange={(e) => setIpfsGatewayUrl(e.target.value)}
                className="ipfs-modal-input"
              />
              <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                Default: https://gateway.pinata.cloud/ipfs/. Set custom gateway to retrieve faster.
              </span>
            </div>

            {/* Connection Test Result */}
            {testResult !== "idle" && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                fontSize: "12.5px",
                lineHeight: "1.4",
                background: testResult === "success" ? "#f0fdf4" : "#fef2f2",
                border: testResult === "success" ? "1px solid #bbf7d0" : "1px solid #fecaca",
                color: testResult === "success" ? "#166534" : "#991b1b"
              }}>
                <IonIcon
                  icon={testResult === "success" ? checkmarkCircleOutline : alertCircleOutline}
                  style={{ fontSize: "18px", flexShrink: 0 }}
                />
                <div>{testMessage}</div>
              </div>
            )}

            {/* Save & Test Buttons */}
            <div style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "12px",
              paddingTop: "16px",
              borderTop: "1px solid #f1f5f9"
            }}>
              <IonButton
                size="small"
                fill="outline"
                color="medium"
                onClick={handleTestConnection}
                disabled={testingConnection}
                style={{ margin: 0, height: "36px", "--border-radius": "8px" }}
              >
                {testingConnection ? (
                  <IonSpinner name="crescent" style={{ width: "16px", height: "16px" }} />
                ) : (
                  "Test Connection"
                )}
              </IonButton>
              <IonButton
                size="small"
                fill="solid"
                color="primary"
                onClick={handleSaveCredentials}
                style={{ margin: 0, height: "36px", "--border-radius": "8px" }}
              >
                Save Credentials
              </IonButton>
            </div>

          </div>
        )}

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          color={toastColor}
          duration={2500}
          position="bottom"
        />
      </IonContent>
    </IonModal>
  );
};
