import React, { useState, useRef, useEffect } from "react";
import {
    IonContent,
    IonPage,
    IonToast,
    IonModal,
    IonButton,
    IonIcon,
    IonAlert,
    useIonLoading
} from "@ionic/react";
import {
    locationOutline,
    mapOutline,
    add,
    trash,
    createOutline,
    closeCircle,
    businessOutline,
    callOutline,
    mailOutline,
    personOutline
} from "ionicons/icons";
import SignatureCanvas from "react-signature-canvas";

import { businessInfoRepository, BusinessAddress, Signature, Logo } from "../data";
import { compressImage, compressDataUrl } from "../utils/imageCompressor";
import "./SettingsPage.css"; // Reuse existing styles

// Icons
const SignatureIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19.07 4.93L17 2.86a2 2 0 00-2.83 0L3 14v5.17h5.17L19.34 8a2 2 0 00.16-2.66l-.43-.41z" />
        <path d="M14 6l4 4" />
        <path d="M12 22s-2-4-8-4" />
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

// SavedItem for UI compatibility (signatures/logos)
interface SavedItem {
    id: string;
    data: string;
    name: string;
}

const BusinessInfoPage: React.FC = () => {
    // const { isDarkMode } = useTheme();
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [presentLoading, dismissLoading] = useIonLoading();

    // Alert state
    const [deleteAlert, setDeleteAlert] = useState<{
        isOpen: boolean;
        type: 'logo' | 'signature' | null;
        id: string | null;
    }>({
        isOpen: false,
        type: null,
        id: null
    });

    // Signature state
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [savedSignatures, setSavedSignatures] = useState<SavedItem[]>([]);
    const [selectedSignatureId, setSelectedSignatureId] = useState<string | null>(null);
    const signatureRef = useRef<SignatureCanvas>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
    const [penColor, setPenColor] = useState("#000000");
    const [penThickness, setPenThickness] = useState(2.5);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    // Effect to measure canvas size when modal opens
    useEffect(() => {
        if (showSignatureModal) {
            // Small delay to ensure modal animation is done and DOM is ready
            const timer = setTimeout(() => {
                if (wrapperRef.current) {
                    setCanvasSize({
                        width: wrapperRef.current.offsetWidth,
                        height: wrapperRef.current.offsetHeight
                    });
                }
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [showSignatureModal]);

    // Logo state
    const [savedLogos, setSavedLogos] = useState<SavedItem[]>([]);
    const [selectedLogoId, setSelectedLogoId] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Address state
    const [savedAddresses, setSavedAddresses] = useState<BusinessAddress[]>([]);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<BusinessAddress | null>(null);
    const [addressFormData, setAddressFormData] = useState({
        label: "",
        streetAddress: "",
        cityStateZip: "",
        phone: "",
        email: ""
    });


    // Load data from localStorage
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load signatures
                const signatures = await businessInfoRepository.getAllSignatures();
                setSavedSignatures(signatures.map(s => ({ id: s.id, data: s.data, name: s.name })));
                const selectedSig = await businessInfoRepository.getSelectedSignatureId();
                setSelectedSignatureId(selectedSig);

                // Load logos
                const logos = await businessInfoRepository.getAllLogos();
                setSavedLogos(logos.map(l => ({ id: l.id, data: l.data, name: l.name })));
                const selectedLg = await businessInfoRepository.getSelectedLogoId();
                setSelectedLogoId(selectedLg);

                // Load addresses
                const addresses = await businessInfoRepository.getAllAddresses();
                setSavedAddresses(addresses);
            } catch (error) {
                console.error('Failed to load business info:', error);
            }
        };
        loadData();
    }, []);

    // --- Delete Confirmation Logic ---
    const handleConfirmDelete = async () => {
        const { type, id } = deleteAlert;
        if (!type || !id) return;

        if (type === 'signature') {
            const success = await businessInfoRepository.deleteSignature(id);
            if (success) {
                const updated = savedSignatures.filter(s => s.id !== id);
                setSavedSignatures(updated);
                if (selectedSignatureId === id) {
                    const newId = updated.length > 0 ? updated[0].id : null;
                    setSelectedSignatureId(newId);
                    await businessInfoRepository.selectSignature(newId);
                }
                setToastMessage("Signature deleted");
                setShowToast(true);
            }
        } else if (type === 'logo') {
            const success = await businessInfoRepository.deleteLogo(id);
            if (success) {
                const updated = savedLogos.filter(l => l.id !== id);
                setSavedLogos(updated);
                if (selectedLogoId === id) {
                    const newId = updated.length > 0 ? updated[0].id : null;
                    setSelectedLogoId(newId);
                    await businessInfoRepository.selectLogo(newId);
                }
                setToastMessage("Logo deleted");
                setShowToast(true);
            }
        }
        setDeleteAlert({ isOpen: false, type: null, id: null });
    };

    // --- Signature Handlers ---
    const handleSaveSignature = async () => {
        if (signatureRef.current && !signatureRef.current.isEmpty()) {
            await presentLoading({ message: 'Saving...', duration: 5000 });
            const rawData = signatureRef.current.toDataURL();
            let finalData = rawData;
            try {
                finalData = await compressDataUrl(rawData, 100 * 1024);
            } catch (error) {
                console.error("Failed to compress signature:", error);
            }

            const newSignature: Signature = {
                id: Date.now().toString(),
                data: finalData,
                name: `Signature ${savedSignatures.length + 1}`,
                isSelected: savedSignatures.length === 0
            };

            const success = await businessInfoRepository.createSignature(newSignature);
            if (success) {
                const updated = [...savedSignatures, { id: newSignature.id, data: newSignature.data, name: newSignature.name }];
                setSavedSignatures(updated);
                if (newSignature.isSelected) {
                    setSelectedSignatureId(newSignature.id);
                }
                setShowSignatureModal(false);
                setToastMessage("Signature saved");
                setShowToast(true);
            }
            await dismissLoading();
        }
    };

    const handleSelectSignature = async (id: string | null) => {
        setSelectedSignatureId(id);
        await businessInfoRepository.selectSignature(id);
    };

    const handleDeleteSignature = (id: string) => {
        setDeleteAlert({ isOpen: true, type: 'signature', id });
    };

    const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await presentLoading({ message: 'Processing signature...', duration: 5000 });

        try {
            const dataUrl = await compressImage(file, 100 * 1024);

            const img = new Image();
            img.onload = async () => {
                // Check for optimal rectangular resolution (e.g., width > height)
                const aspectRatio = img.width / img.height;
                if (aspectRatio < 1.5) {
                    setToastMessage("Recommendation: Use a wider rectangular image (3:1 ratio)");
                    // We simply warn, but still allow if the user insists, or we can just proceed.
                    // The user asked for "feature... of a particular optimal resolution". 
                    // Showing a warning is good user guidance.
                }

                const newSignature: Signature = {
                    id: Date.now().toString(),
                    data: dataUrl,
                    name: file.name.split('.')[0] || `Signature ${savedSignatures.length + 1}`,
                    isSelected: savedSignatures.length === 0
                };

                const success = await businessInfoRepository.createSignature(newSignature);
                if (success) {
                    const updated = [...savedSignatures, { id: newSignature.id, data: newSignature.data, name: newSignature.name }];
                    setSavedSignatures(updated);
                    if (newSignature.isSelected) {
                        setSelectedSignatureId(newSignature.id);
                    }
                    setToastMessage("Signature uploaded");
                    setShowToast(true);
                }
            };
            img.src = dataUrl;
        } catch (error) {
            console.error("Failed to process signature:", error);
            setToastMessage("Failed to process image");
            setShowToast(true);
        } finally {
            await dismissLoading();
        }
        e.target.value = '';
    };

    // --- Logo Handlers ---
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await presentLoading({ message: 'Processing image...', duration: 5000 });

        try {
            const dataUrl = await compressImage(file, 100 * 1024);

            const newLogo: Logo = {
                id: Date.now().toString(),
                data: dataUrl,
                name: file.name.split('.')[0] || `Logo ${savedLogos.length + 1}`,
                isSelected: savedLogos.length === 0
            };

            const success = await businessInfoRepository.createLogo(newLogo);
            if (success) {
                const updated = [...savedLogos, { id: newLogo.id, data: newLogo.data, name: newLogo.name }];
                setSavedLogos(updated);
                if (newLogo.isSelected) {
                    setSelectedLogoId(newLogo.id);
                }
                setToastMessage("Logo uploaded");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Failed to process logo:", error);
            setToastMessage("Failed to process image");
            setShowToast(true);
        } finally {
            await dismissLoading();
        }
        e.target.value = '';
    };

    const handleSelectLogo = async (id: string | null) => {
        setSelectedLogoId(id);
        await businessInfoRepository.selectLogo(id);
    };

    const handleDeleteLogo = (id: string) => {
        setDeleteAlert({ isOpen: true, type: 'logo', id });
    };

    // --- Address Handlers ---
    const handleOpenAddressModal = (addr?: BusinessAddress) => {
        if (savedAddresses.length >= 3 && !addr) {
            setToastMessage("Maximum 3 addresses allowed");
            setShowToast(true);
            return;
        }
        if (addr) {
            setEditingAddress(addr);
            setAddressFormData({
                label: addr.label,
                streetAddress: addr.streetAddress || "",
                cityStateZip: addr.cityStateZip || "",
                phone: addr.phone || "",
                email: addr.email || ""
            });
        } else {
            setEditingAddress(null);
            setAddressFormData({
                label: "",
                streetAddress: "",
                cityStateZip: "",
                phone: "",
                email: ""
            });
        }
        setShowAddressModal(true);
    };

    const handleSaveAddress = async () => {
        if (!addressFormData.label) {
            setToastMessage("Name/Company Name is required");
            setShowToast(true);
            return;
        }

        const newAddress: BusinessAddress = {
            id: editingAddress ? editingAddress.id : Date.now().toString(),
            label: addressFormData.label,
            streetAddress: addressFormData.streetAddress,
            cityStateZip: addressFormData.cityStateZip,
            phone: addressFormData.phone,
            email: addressFormData.email
        };

        const success = await businessInfoRepository.saveAddress(newAddress);

        if (success) {
            // Reload addresses from database
            const updatedAddresses = await businessInfoRepository.getAllAddresses();
            setSavedAddresses(updatedAddresses);
            setShowAddressModal(false);
            setToastMessage(editingAddress ? "Address updated" : "Address added");
        } else {
            setToastMessage("Failed to save address");
        }
        setShowToast(true);
    };

    const handleDeleteAddress = async (id: string) => {
        const success = await businessInfoRepository.deleteAddress(id);
        if (success) {
            const updated = savedAddresses.filter(a => a.id !== id);
            setSavedAddresses(updated);
            setToastMessage("Address deleted");
        } else {
            setToastMessage("Failed to delete address");
        }
        setShowToast(true);
    };


    return (
        <IonPage>
            <IonContent fullscreen>
                <div className="settings-container light" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', paddingTop: '24px' }}>

                    {/* Addresses Section */}
                    <section className="settings-section">
                        <div className="settings-section-header">
                            <IonIcon icon={locationOutline} style={{ fontSize: '24px', color: 'var(--ion-color-primary)' }} />
                            <h2>Business Addresses</h2>
                        </div>

                        <div className="settings-card" style={{ padding: '0' }}>
                            {savedAddresses.length === 0 ? (
                                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ion-color-medium)' }}>
                                    <p>No addresses added yet.</p>
                                </div>
                            ) : (
                                <div className="settings-media-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {savedAddresses.map((addr, index) => (
                                        <div key={addr.id} style={{
                                            padding: '20px',
                                            borderBottom: index < savedAddresses.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ flex: 1, marginRight: '16px' }}>
                                                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <IonIcon icon={businessOutline} style={{ fontSize: '18px', color: 'var(--ion-color-primary)' }} />
                                                    {addr.label}
                                                </div>
                                                <div style={{ fontSize: '14px', color: 'var(--ion-color-medium)', lineHeight: '1.5', paddingLeft: '26px' }}>
                                                    {addr.streetAddress && <div>{addr.streetAddress}</div>}
                                                    {addr.cityStateZip && <div>{addr.cityStateZip}</div>}
                                                    {(addr.phone || addr.email) && (
                                                        <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                            {addr.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IonIcon icon={callOutline} style={{ fontSize: '12px' }} /> {addr.phone}</div>}
                                                            {addr.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IonIcon icon={mailOutline} style={{ fontSize: '12px' }} /> {addr.email}</div>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <IonButton fill="clear" size="small" onClick={() => handleOpenAddressModal(addr)}>
                                                    <IonIcon slot="icon-only" icon={createOutline} />
                                                </IonButton>
                                                <IonButton fill="clear" color="danger" size="small" onClick={() => handleDeleteAddress(addr.id)}>
                                                    <IonIcon slot="icon-only" icon={trash} />
                                                </IonButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {savedAddresses.length < 3 && (
                                <div style={{ padding: '16px', borderTop: savedAddresses.length > 0 ? '1px solid #f1f5f9' : 'none' }}>
                                    <IonButton fill="outline" expand="block" onClick={() => handleOpenAddressModal()} style={{ '--border-radius': '12px' }}>
                                        <IonIcon slot="start" icon={add} />
                                        Add Address ({savedAddresses.length}/3)
                                    </IonButton>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Logo Section */}
                    <section className="settings-section">
                        <div className="settings-section-header">
                            <LogoIcon />
                            <h2>Logos</h2>
                        </div>

                        <div className="settings-card">
                            <div className="settings-media-grid">
                                {/* None option */}
                                <div
                                    className={`settings-media-item ${selectedLogoId === null ? 'selected' : ''}`}
                                    onClick={() => handleSelectLogo(null)}
                                >
                                    <span className="settings-media-none">None</span>
                                    {selectedLogoId === null && (
                                        <div className="settings-media-check"><CheckIcon /></div>
                                    )}
                                </div>

                                {savedLogos.map(logo => (
                                    <div
                                        key={logo.id}
                                        className={`settings-media-item ${selectedLogoId === logo.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectLogo(logo.id)}
                                    >
                                        <img src={logo.data} alt="Logo" />
                                        {selectedLogoId === logo.id && (
                                            <div className="settings-media-check"><CheckIcon /></div>
                                        )}
                                        <button
                                            className="settings-media-delete"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteLogo(logo.id); }}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}

                                {savedLogos.length < 3 && (
                                    <button
                                        className="settings-media-add"
                                        onClick={() => logoInputRef.current?.click()}
                                    >
                                        <UploadIcon />
                                        <span>Upload</span>
                                    </button>
                                )}
                            </div>
                            <input
                                ref={logoInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleLogoUpload}
                            />
                        </div>
                    </section>

                    {/* Signature Section */}
                    <section className="settings-section">
                        <div className="settings-section-header">
                            <SignatureIcon />
                            <h2>Signatures</h2>
                        </div>

                        <div className="settings-card">
                            <div className="settings-media-grid">
                                {/* None option */}
                                <div
                                    className={`settings-media-item ${selectedSignatureId === null ? 'selected' : ''}`}
                                    onClick={() => handleSelectSignature(null)}
                                >
                                    <span className="settings-media-none">None</span>
                                    {selectedSignatureId === null && (
                                        <div className="settings-media-check"><CheckIcon /></div>
                                    )}
                                </div>

                                {savedSignatures.map(sig => (
                                    <div
                                        key={sig.id}
                                        className={`settings-media-item ${selectedSignatureId === sig.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectSignature(sig.id)}
                                    >
                                        <img src={sig.data} alt="Signature" />
                                        {selectedSignatureId === sig.id && (
                                            <div className="settings-media-check"><CheckIcon /></div>
                                        )}
                                        <button
                                            className="settings-media-delete"
                                            onClick={(e) => { e.stopPropagation(); handleDeleteSignature(sig.id); }}
                                        >
                                            <TrashIcon />
                                        </button>
                                    </div>
                                ))}

                                {savedSignatures.length < 3 && (
                                    <>
                                        <button
                                            className="settings-media-add"
                                            onClick={() => setShowSignatureModal(true)}
                                        >
                                            <PlusIcon />
                                            <span>Draw</span>
                                        </button>
                                        <button
                                            className="settings-media-add"
                                            onClick={() => signatureInputRef.current?.click()}
                                        >
                                            <UploadIcon />
                                            <span>Upload</span>
                                        </button>
                                    </>
                                )}
                            </div>
                            <input
                                ref={signatureInputRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleSignatureUpload}
                            />
                        </div>
                    </section>
                </div>

                {/* Signature Modal */}
                <IonModal
                    isOpen={showSignatureModal}
                    onDidDismiss={() => setShowSignatureModal(false)}
                    style={{
                        '--height': 'auto',
                        '--width': '95%',
                        '--max-width': '450px',
                        '--border-radius': '16px',
                        '--background': '#ffffff',
                        '--box-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                    }}
                >
                    <div className="signature-modal light">
                        <div className="signature-modal-header">
                            <h3>Draw Signature</h3>
                            <button onClick={() => setShowSignatureModal(false)}>×</button>
                        </div>
                        <div className="signature-modal-content">
                            <div
                                className="signature-canvas-wrapper"
                                ref={wrapperRef}
                                style={{ height: '200px', width: '100%', position: 'relative', border: '1px solid var(--ion-color-step-150, #e2e8f0)', borderRadius: '8px' }}
                            >
                                {canvasSize.width > 0 && (
                                    <SignatureCanvas
                                        ref={signatureRef}
                                        penColor={penColor}
                                        minWidth={penThickness}
                                        maxWidth={penThickness + 1}
                                        canvasProps={{
                                            width: canvasSize.width,
                                            height: canvasSize.height,
                                            className: 'signature-canvas',
                                            style: { width: '100%', height: '100%', display: 'block', touchAction: 'none' }
                                        }}
                                    />
                                )}
                            </div>
                            <div className="signature-options">
                                <div className="signature-colors">
                                    {['#000000', '#0066CC', '#CC0000', '#00AA00'].map(color => (
                                        <button
                                            key={color}
                                            className={`signature-color ${penColor === color ? 'active' : ''}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setPenColor(color)}
                                        />
                                    ))}
                                </div>
                                <div className="signature-thickness">
                                    <label>Thickness</label>
                                    <div className="signature-thickness-control">
                                        <input
                                            type="range"
                                            min="1"
                                            max="8"
                                            step="0.5"
                                            value={penThickness}
                                            onChange={(e) => setPenThickness(parseFloat(e.target.value))}
                                            className="signature-thickness-slider"
                                        />
                                        <div className="signature-preview-container">
                                            <div
                                                className="signature-thickness-preview"
                                                style={{
                                                    width: `${penThickness * 3}px`,
                                                    height: `${penThickness * 3}px`,
                                                    backgroundColor: penColor
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="signature-actions">
                                <IonButton fill="outline" onClick={() => signatureRef.current?.clear()}>
                                    Clear
                                </IonButton>
                                <IonButton onClick={handleSaveSignature}>
                                    Save Signature
                                </IonButton>
                            </div>
                        </div>
                    </div>
                </IonModal>

                {/* Address Modal */}
                <IonModal
                    isOpen={showAddressModal}
                    onDidDismiss={() => setShowAddressModal(false)}
                    style={{
                        '--height': 'auto',
                        '--width': '95%',
                        '--max-width': '480px',
                        '--max-height': '90vh',
                        '--border-radius': '24px',
                        '--background': '#ffffff',
                        '--box-shadow': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        '--overflow': 'hidden'
                    }}
                >
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
                        <div className="signature-modal-header" style={{ borderBottom: '1px solid #f1f5f9', padding: '20px 24px', background: '#ffffff', flexShrink: 0 }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.01em', color: '#0f172a' }}>{editingAddress ? 'Edit Address' : 'New Address'}</h3>
                            <button onClick={() => setShowAddressModal(false)} style={{ background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '10px', color: '#64748b', transition: 'all 0.2s' }}>×</button>
                        </div>

                        <div style={{ padding: '24px', background: '#ffffff', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Label / Company Name */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-medium)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Name / Company Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ion-color-medium)', display: 'flex' }}>
                                            <IonIcon icon={businessOutline} style={{ fontSize: '18px' }} />
                                        </div>
                                        <input
                                            type="text"
                                            value={addressFormData.label}
                                            onChange={(e) => setAddressFormData({ ...addressFormData, label: e.target.value })}
                                            className="settings-number-input"
                                            placeholder="Enter Your Company Name"
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px 16px 12px 42px',


                                                background: '#f8fafc',
                                                borderColor: '#e2e8f0',
                                                color: '#0f172a'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Street Address */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-medium)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Street Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ion-color-medium)', display: 'flex' }}>
                                            <IonIcon icon={locationOutline} style={{ fontSize: '18px' }} />
                                        </div>
                                        <input
                                            type="text"
                                            value={addressFormData.streetAddress}
                                            onChange={(e) => setAddressFormData({ ...addressFormData, streetAddress: e.target.value })}
                                            className="settings-number-input"
                                            placeholder="Street and Number"
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px 16px 12px 42px',

                                                background: '#f8fafc',
                                                borderColor: '#e2e8f0',
                                                color: '#0f172a'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* City, State, Zip */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-medium)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>City, State, Zip</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ion-color-medium)', display: 'flex' }}>
                                            <IonIcon icon={mapOutline} style={{ fontSize: '18px' }} />
                                        </div>
                                        <input
                                            type="text"
                                            value={addressFormData.cityStateZip}
                                            onChange={(e) => setAddressFormData({ ...addressFormData, cityStateZip: e.target.value })}
                                            className="settings-number-input"
                                            placeholder="City, State, Zip Code"
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px 16px 12px 42px',

                                                background: '#f8fafc',
                                                borderColor: '#e2e8f0',
                                                color: '#0f172a'
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-medium)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Contact Info</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ion-color-medium)', display: 'flex' }}>
                                                <IonIcon icon={callOutline} style={{ fontSize: '18px' }} />
                                            </div>
                                            <input
                                                type="tel"
                                                value={addressFormData.phone}
                                                onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                                                className="settings-number-input"
                                                placeholder="Phone Number"
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px 16px 12px 42px',


                                                    background: '#f8fafc',
                                                    borderColor: '#e2e8f0',
                                                    color: '#0f172a'
                                                }}
                                            />
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ion-color-medium)', display: 'flex' }}>
                                                <IonIcon icon={mailOutline} style={{ fontSize: '18px' }} />
                                            </div>
                                            <input
                                                type="email"
                                                value={addressFormData.email}
                                                onChange={(e) => setAddressFormData({ ...addressFormData, email: e.target.value })}
                                                className="settings-number-input"
                                                placeholder="Email Address"
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px 16px 12px 42px',


                                                    background: '#f8fafc',
                                                    borderColor: '#e2e8f0',
                                                    color: '#0f172a'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="signature-actions" style={{ padding: '20px 24px', gap: '12px', borderTop: '1px solid #f1f5f9', background: '#ffffff', marginTop: 0, flexShrink: 0 }}>
                            <IonButton fill="clear" onClick={() => setShowAddressModal(false)} style={{ flex: 1, minHeight: '48px', '--border-radius': '12px', fontWeight: 600, color: 'var(--ion-color-medium)', textTransform: 'none' }}>
                                Cancel
                            </IonButton>
                            <IonButton onClick={handleSaveAddress} color="primary" style={{ flex: 1, minHeight: '48px', '--border-radius': '12px', fontWeight: 600, '--box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', textTransform: 'none' }}>
                                {editingAddress ? 'Save Changes' : 'Add Address'}
                            </IonButton>
                        </div>
                    </div>
                </IonModal>

                <IonToast
                    isOpen={showToast}
                    onDidDismiss={() => setShowToast(false)}
                    message={toastMessage}
                    duration={2000}
                    position="bottom"
                />

                <IonAlert
                    isOpen={deleteAlert.isOpen}
                    onDidDismiss={() => setDeleteAlert({ ...deleteAlert, isOpen: false })}
                    header={`Delete ${deleteAlert.type === 'logo' ? 'Logo' : 'Signature'}?`}
                    message={`Are you sure you want to delete this ${deleteAlert.type === 'logo' ? 'logo' : 'signature'}? This action cannot be undone.`}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => setDeleteAlert({ ...deleteAlert, isOpen: false })
                        },
                        {
                            text: 'Delete',
                            role: 'destructive',
                            handler: handleConfirmDelete
                        }
                    ]}
                />
            </IonContent>
        </IonPage>
    );
};

export default BusinessInfoPage;
