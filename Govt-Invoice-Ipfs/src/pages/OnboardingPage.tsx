import React, { useState, useRef, useEffect } from "react";
import { compressImage, compressDataUrl } from "../utils/imageCompressor";
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    IonToast,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    useIonAlert,
    useIonRouter,
    useIonLoading,
} from "@ionic/react";
import { App as CapacitorApp } from '@capacitor/app';
import { useInvoice } from "../contexts/InvoiceContext";
import {
    arrowForward,
    arrowBack,
    checkmarkCircle,
    locationOutline,
    businessOutline,
    callOutline,
    mailOutline,
    add,
    cloudUploadOutline,
    trash,
} from "ionicons/icons";
import { motion, AnimatePresence } from "framer-motion";
import SignatureCanvas from "react-signature-canvas";
// import { useHistory } from "react-router-dom";

import {
    businessInfoRepository,
    inventoryRepository,
    BusinessAddress,
    Signature,
    Logo,
    InventoryItem,
} from "../data";
import {
    WelcomeIcon,
    AddressIcon,
    LogoIcon,
    SignatureIcon,
    InventoryIcon,
    CompleteIcon
} from "../components/OnboardingIcons";
import "./OnboardingPage.css";
import { useStatusBar, StatusBarPresets } from "../hooks/useStatusBar";


// Step definitions
interface OnboardingStep {
    id: number;
    key: string;
    title: string;
    subtitle: string;
    color: string;
}

const steps: OnboardingStep[] = [
    {
        id: 0,
        key: "welcome",
        title: "Welcome to Invoice",
        subtitle: "Let's set up your business profile in just a few steps",
        color: "#6366f1",
    },
    {
        id: 1,
        key: "address",
        title: "Business Address",
        subtitle: "Add your company details for invoices",
        color: "#3b82f6",
    },
    {
        id: 2,
        key: "logo",
        title: "Company Logo",
        subtitle: "Upload your brand logo",
        color: "#10b981",
    },
    {
        id: 3,
        key: "signature",
        title: "Your Signature",
        subtitle: "Draw your signature for documents",
        color: "#f59e0b",
    },
    {
        id: 4,
        key: "inventory",
        title: "Products & Services",
        subtitle: "Add items you frequently invoice",
        color: "#ec4899",
    },
    {
        id: 5,
        key: "complete",
        title: "You're All Set!",
        subtitle: "Start creating professional invoices",
        color: "#8b5cf6",
    },
];

const OnboardingPage: React.FC = () => {
    const router = useIonRouter();

    const { updateCurrency } = useInvoice();
    const [currentStep, setCurrentStep] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("USD");
    const [presentAlert] = useIonAlert();
    const [presentLoading, dismissLoading] = useIonLoading();

    // Use StatusBar
    useStatusBar(StatusBarPresets.light);

    // Handle Hardware Back Button
    useEffect(() => {
        const handleBackButton = (ev: any) => {
            ev.detail.register(10, () => {
                presentAlert({
                    header: 'Exit App',
                    message: 'Are you sure you want to exit?',
                    buttons: [
                        { text: 'Cancel', role: 'cancel' },
                        { text: 'Exit', handler: () => CapacitorApp.exitApp() }
                    ]
                });
            });
        };

        document.addEventListener('ionBackButton', handleBackButton);
        return () => {
            document.removeEventListener('ionBackButton', handleBackButton);
        };
    }, [presentAlert]);

    // Address state
    const [addressFormData, setAddressFormData] = useState({
        label: "",
        streetAddress: "",
        cityStateZip: "",
        phone: "",
        email: "",
    });

    // Logo state
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    // Signature state
    const signatureRef = useRef<SignatureCanvas>(null);
    const [signatureSaved, setSignatureSaved] = useState(false);
    const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
    const [uploadedSignature, setUploadedSignature] = useState<string | null>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    // Inventory state
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [itemFormData, setItemFormData] = useState({
        name: "",
        description: "",
        price: "",
    });

    // Load existing data
    useEffect(() => {
        const loadExistingData = async () => {
            try {
                // Load existing inventory items
                const items = await inventoryRepository.getAll();
                setInventoryItems(items);

                // Check if already has address
                const addresses = await businessInfoRepository.getAllAddresses();
                if (addresses.length > 0) {
                    const addr = addresses[0];
                    setAddressFormData({
                        label: addr.label || "",
                        streetAddress: addr.streetAddress || "",
                        cityStateZip: addr.cityStateZip || "",
                        phone: addr.phone || "",
                        email: addr.email || "",
                    });
                }

                // Check if already has logo
                const logos = await businessInfoRepository.getAllLogos();
                if (logos.length > 0) {
                    setLogoPreview(logos[0].data);
                }

                // Check if already has signature
                const signatures = await businessInfoRepository.getAllSignatures();
                if (signatures.length > 0) {
                    setSignatureSaved(true);
                    if (signatures[0].data.startsWith('data:image')) {
                        setUploadedSignature(signatures[0].data);
                    }
                }
            } catch (error) {
                console.error("Failed to load existing data:", error);
            }
        };
        loadExistingData();
    }, []);

    // Navigation
    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const skipStep = () => {
        nextStep();
    };



    // --- Address Handlers ---
    const handleSaveAddress = async () => {
        if (!addressFormData.label) {
            setToastMessage("Company name is required");
            setShowToast(true);
            return;
        }

        const newAddress: BusinessAddress = {
            id: Date.now().toString(),
            label: addressFormData.label,
            streetAddress: addressFormData.streetAddress,
            cityStateZip: addressFormData.cityStateZip,
            phone: addressFormData.phone,
            email: addressFormData.email,
        };

        const success = await businessInfoRepository.saveAddress(newAddress);
        if (success) {
            updateCurrency(selectedCurrency);
            setToastMessage("Address saved!");
            setShowToast(true);
            nextStep();
        } else {
            setToastMessage("Failed to save address");
            setShowToast(true);
        }
    };



    // --- Logo Handlers ---
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await presentLoading({ message: 'Processing image...', duration: 5000 });

        try {
            const dataUrl = await compressImage(file, 100 * 1024);
            setLogoPreview(dataUrl);

            const newLogo: Logo = {
                id: Date.now().toString(),
                data: dataUrl,
                name: file.name.split(".")[0] || "Logo",
                isSelected: true,
            };

            const success = await businessInfoRepository.createLogo(newLogo);
            if (success) {
                setToastMessage("Logo uploaded!");
                setShowToast(true);
            }
        } catch (error) {
            console.error("Failed to process logo:", error);
            setToastMessage("Failed to process image");
            setShowToast(true);
        } finally {
            await dismissLoading();
        }
        e.target.value = "";
    };

    // --- Signature Handlers ---
    const handleSaveSignature = async () => {
        let signatureData = null;

        if (signatureMode === "draw") {
            if (signatureRef.current && !signatureRef.current.isEmpty()) {
                await presentLoading({ message: 'Saving...', duration: 5000 });
                const rawData = signatureRef.current.toDataURL();
                try {
                    signatureData = await compressDataUrl(rawData, 100 * 1024);
                } catch (error) {
                    console.error("Failed to compress signature:", error);
                    signatureData = rawData;
                } finally {
                    await dismissLoading();
                }
            }
        } else {
            signatureData = uploadedSignature;
        }

        if (signatureData) {
            const newSignature: Signature = {
                id: Date.now().toString(),
                data: signatureData,
                name: "My Signature",
                isSelected: true,
            };

            const success = await businessInfoRepository.createSignature(newSignature);
            if (success) {
                setSignatureSaved(true);
                setToastMessage("Signature saved!");
                setShowToast(true);
                nextStep();
            }
        } else {
            setToastMessage(signatureMode === "draw" ? "Please draw your signature first" : "Please upload a signature image");
            setShowToast(true);
        }
    };

    const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await presentLoading({ message: 'Processing signature...', duration: 5000 });

        try {
            const dataUrl = await compressImage(file, 100 * 1024);
            setUploadedSignature(dataUrl);
        } catch (error) {
            console.error("Failed to process signature:", error);
            setToastMessage("Failed to process image");
            setShowToast(true);
        } finally {
            await dismissLoading();
        }
        e.target.value = "";
    };

    const clearSignature = () => {
        if (signatureMode === "draw") {
            signatureRef.current?.clear();
        } else {
            setUploadedSignature(null);
        }
        setSignatureSaved(false);
    };

    // --- Inventory Handlers ---
    const handleAddItem = async () => {
        if (!itemFormData.name) {
            setToastMessage("Item name is required");
            setShowToast(true);
            return;
        }

        const newItem: InventoryItem = {
            id: Date.now().toString(),
            name: itemFormData.name,
            description: itemFormData.description || "",
            price: Number(itemFormData.price) || 0,
            stock: 0,
            isInfiniteStock: false,
        };

        const success = await inventoryRepository.save(newItem);
        if (success) {
            const updatedItems = await inventoryRepository.getAll();
            setInventoryItems(updatedItems);
            setItemFormData({ name: "", description: "", price: "" });
            setToastMessage("Item added!");
            setShowToast(true);
        }
    };

    const handleDeleteItem = async (id: string) => {
        const success = await inventoryRepository.delete(id);
        if (success) {
            const updatedItems = await inventoryRepository.getAll();
            setInventoryItems(updatedItems);
            setToastMessage("Item removed");
            setShowToast(true);
        } else {
            setToastMessage("Failed to remove item");
            setShowToast(true);
        }
    };

    const currentStepData = steps[currentStep];
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === steps.length - 1;

    const renderStepIcon = (key: string, color: string) => {
        switch (key) {
            case "welcome": return <WelcomeIcon color={color} size={40} />;
            case "address": return <AddressIcon color={color} size={40} />;
            case "logo": return <LogoIcon color={color} size={40} />;
            case "signature": return <SignatureIcon color={color} size={40} />;
            case "inventory": return <InventoryIcon color={color} size={40} />;
            case "complete": return <CompleteIcon color={color} size={40} />;
            default: return null;
        }
    }

    // Render step content
    const renderStepContent = () => {
        switch (currentStepData.key) {
            case "welcome":
                return (
                    <div className="onboarding-welcome">
                        <div className="welcome-features">
                            <div className="feature-item">
                                <IonIcon icon={checkmarkCircle} color="success" />
                                <span>Invoice Tracking and Management</span>
                            </div>
                            <div className="feature-item">
                                <IonIcon icon={checkmarkCircle} color="success" />
                                <span>Works Completely Offline</span>
                            </div>
                            <div className="feature-item">
                                <IonIcon icon={checkmarkCircle} color="success" />
                                <span>No Account Required</span>
                            </div>
                            <div className="feature-item">
                                <IonIcon icon={checkmarkCircle} color="success" />
                                <span>Export to PDF Instantly</span>
                            </div>
                        </div>
                    </div>
                );

            case "address":
                return (
                    <div className="onboarding-form">
                        <div className="form-group">
                            <label>Company Name *</label>
                            <div className="input-wrapper">
                                <IonIcon icon={businessOutline} />
                                <input
                                    type="text"
                                    placeholder="Your Company Name"
                                    value={addressFormData.label}
                                    onChange={(e) =>
                                        setAddressFormData({ ...addressFormData, label: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Street Address</label>
                            <div className="input-wrapper">
                                <IonIcon icon={locationOutline} />
                                <input
                                    type="text"
                                    placeholder="123 Business St"
                                    value={addressFormData.streetAddress}
                                    onChange={(e) =>
                                        setAddressFormData({ ...addressFormData, streetAddress: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>City, State, ZIP</label>
                            <div className="input-wrapper">
                                <IonIcon icon={locationOutline} />
                                <input
                                    type="text"
                                    placeholder="New York, NY 10001"
                                    value={addressFormData.cityStateZip}
                                    onChange={(e) =>
                                        setAddressFormData({ ...addressFormData, cityStateZip: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <div className="input-wrapper">
                                <IonIcon icon={callOutline} />
                                <input
                                    type="tel"
                                    placeholder="+1 234 567 890"
                                    value={addressFormData.phone}
                                    onChange={(e) =>
                                        setAddressFormData({ ...addressFormData, phone: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <IonIcon icon={mailOutline} />
                                <input
                                    type="email"
                                    placeholder="hello@company.com"
                                    value={addressFormData.email}
                                    onChange={(e) =>
                                        setAddressFormData({ ...addressFormData, email: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Default Currency</label>
                            <div className="input-wrapper">
                                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px', color: '#666' }}>
                                    <span style={{ fontSize: '1.2em' }}>{(0).toLocaleString(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\\d/g, '').trim()}</span>
                                </div>
                                <select
                                    value={selectedCurrency}
                                    onChange={(e) => setSelectedCurrency(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'inherit',
                                        outline: 'none',
                                        appearance: 'none',
                                        fontSize: '16px'
                                    }}
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                    <option value="GBP">GBP (£)</option>
                                    <option value="INR">INR (₹)</option>
                                    <option value="AUD">AUD (A$)</option>
                                    <option value="CAD">CAD (C$)</option>
                                    <option value="JPY">JPY (¥)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );

            case "logo":
                return (
                    <div className="onboarding-logo">
                        <div
                            className={`logo-upload-area ${logoPreview ? "has-logo" : ""}`}
                            onClick={() => logoInputRef.current?.click()}
                        >
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo preview" className="logo-preview" />
                            ) : (
                                <>
                                    <div className="upload-icon">
                                        <IonIcon icon={cloudUploadOutline} />
                                    </div>
                                    <p className="upload-text">Tap to upload logo</p>
                                    <p className="upload-hint">PNG, JPG — auto-optimized</p>
                                </>
                            )}
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleLogoUpload}
                        />
                        {logoPreview && (
                            <IonButton
                                fill="clear"
                                size="small"
                                onClick={() => logoInputRef.current?.click()}
                                className="change-logo-btn"
                            >
                                Change Logo
                            </IonButton>
                        )}
                    </div>
                );

            case "signature":
                return (
                    <div className="onboarding-signature">
                        <IonSegment value={signatureMode} onIonChange={e => setSignatureMode(e.detail.value as any)} style={{ marginBottom: '16px', borderRadius: '8px', background: '#f0f0f0' }}>
                            <IonSegmentButton value="draw">
                                <IonLabel>Draw</IonLabel>
                            </IonSegmentButton>
                            <IonSegmentButton value="upload">
                                <IonLabel>Upload</IonLabel>
                            </IonSegmentButton>
                        </IonSegment>

                        {signatureMode === "draw" ? (
                            <div className="signature-pad-container">
                                <SignatureCanvas
                                    ref={signatureRef}
                                    penColor="#000000"
                                    canvasProps={{
                                        className: "signature-canvas",
                                    }}
                                    backgroundColor="transparent"
                                />
                            </div>
                        ) : (
                            <div className="onboarding-logo">
                                <div
                                    className={`logo-upload-area ${uploadedSignature ? "has-logo" : ""}`}
                                    onClick={() => signatureInputRef.current?.click()}
                                    style={{ height: '200px' }}
                                >
                                    {uploadedSignature ? (
                                        <img src={uploadedSignature} alt="Signature preview" className="logo-preview" style={{ objectFit: 'contain' }} />
                                    ) : (
                                        <>
                                            <div className="upload-icon">
                                                <IonIcon icon={cloudUploadOutline} />
                                            </div>
                                            <p className="upload-text">Tap to upload signature</p>
                                            <p className="upload-hint">PNG, JPG — auto-optimized</p>
                                        </>
                                    )}
                                </div>
                                <input
                                    ref={signatureInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: "none" }}
                                    onChange={handleSignatureUpload}
                                />
                            </div>
                        )}

                        <div className="signature-actions">
                            <IonButton fill="clear" size="small" onClick={clearSignature}>
                                {signatureMode === "draw" ? "Clear" : "Remove"}
                            </IonButton>
                        </div>
                        {signatureSaved && (
                            <div className="signature-saved-badge">
                                <IonIcon icon={checkmarkCircle} color="success" />
                                <span>Signature saved</span>
                            </div>
                        )}
                    </div>
                );

            case "inventory":
                return (
                    <div className="onboarding-inventory">
                        <div className="inventory-form">
                            <div className="form-group">
                                <label>Item Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter Item Name"
                                    value={itemFormData.name}
                                    onChange={(e) =>
                                        setItemFormData({ ...itemFormData, name: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={itemFormData.price}
                                    onChange={(e) =>
                                        setItemFormData({ ...itemFormData, price: e.target.value })
                                    }
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: '16px', display: 'none' }}></div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                placeholder="Add details about this item..."
                                value={itemFormData.description}
                                onChange={(e) =>
                                    setItemFormData({ ...itemFormData, description: e.target.value })
                                }
                                className="inventory-textarea"
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    background: '#f8fafc',
                                    border: '1.5px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    color: '#0f172a',
                                    outline: 'none',
                                    resize: 'none',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>
                        <IonButton
                            expand="block"
                            onClick={handleAddItem}
                            className="add-item-btn"
                        >
                            <IonIcon slot="start" icon={add} />
                            Add Item
                        </IonButton>


                        {
                            inventoryItems.length > 0 && (
                                <div className="inventory-list">
                                    <h4>Added Items ({inventoryItems.length})</h4>
                                    {inventoryItems.slice(0, 3).map((item) => (
                                        <div key={item.id} className="inventory-item">
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span className="item-name">{item.name}</span>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span className="item-price">
                                                    {new Intl.NumberFormat(undefined, { style: 'currency', currency: selectedCurrency }).format(item.price)}
                                                </span>
                                                <IonButton
                                                    fill="clear"
                                                    size="small"
                                                    onClick={() => handleDeleteItem(item.id)}
                                                    style={{ margin: 0, height: '32px', width: '32px' }}
                                                >
                                                    <IonIcon icon={trash} color="medium" style={{ fontSize: '18px' }} />
                                                </IonButton>
                                            </div>
                                        </div>
                                    ))}
                                    {inventoryItems.length > 3 && (
                                        <p className="more-items">+{inventoryItems.length - 3} more items</p>
                                    )}
                                </div>
                            )
                        }
                    </div >
                );

            case "complete":
                return (
                    <div className="onboarding-complete">

                        <div className="completion-stats">
                            <div className="stat-item">
                                <span className="stat-value">
                                    {addressFormData.label ? "✓" : "—"}
                                </span>
                                <span className="stat-label">Business Info</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{logoPreview ? "✓" : "—"}</span>
                                <span className="stat-label">Logo</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{signatureSaved ? "✓" : "—"}</span>
                                <span className="stat-label">Signature</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-value">{inventoryItems.length}</span>
                                <span className="stat-label">Items</span>
                            </div>
                        </div>
                        <p className="completion-hint">
                            Tap <strong>"Create"</strong> on the dashboard to make your first invoice!
                        </p>
                    </div>
                );

            default:
                return null;
        }
    };

    // Get action button config
    const getActionButton = () => {
        switch (currentStepData.key) {
            case "welcome":
                return { label: "Get Started", action: nextStep };
            case "address":
                return { label: "Save & Continue", action: handleSaveAddress };
            case "logo":
                return { label: "Continue", action: nextStep };
            case "signature":
                return { label: "Save & Continue", action: handleSaveSignature };
            case "inventory":
                return { label: "Continue", action: nextStep };
            case "complete":
                return { label: "Start Creating", action: () => { } }; // Action handled by routerLink
            default:
                return { label: "Continue", action: nextStep };
        }
    };

    const actionButton = getActionButton();
    const canSkip = ["address", "logo", "signature", "inventory"].includes(currentStepData.key);

    return (
        <IonPage className="onboarding-page light">
            <IonContent fullscreen className="onboarding-content">
                {/* Progress Bar */}
                <div className="onboarding-progress">
                    <div
                        className="progress-fill"
                        style={{
                            width: `${((currentStep + 1) / steps.length) * 100}%`,
                            backgroundColor: currentStepData.color,
                        }}
                    />
                </div>

                {/* Skip Button */}
                {canSkip && (
                    <div className="skip-container">
                        <IonButton fill="clear" size="small" onClick={skipStep}>
                            Skip
                        </IonButton>
                    </div>
                )}

                {/* Main Content */}
                <div className="onboarding-main">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.25 }}
                            className="step-container"
                        >
                            {/* Step Header */}
                            <div className="step-header">
                                <div
                                    className="step-icon"
                                    style={{ backgroundColor: `${currentStepData.color}15` }}
                                >
                                    {renderStepIcon(currentStepData.key, currentStepData.color)}
                                </div>
                                <h1 className="step-title">{currentStepData.title}</h1>
                                <p className="step-subtitle">{currentStepData.subtitle}</p>
                            </div>

                            {/* Step Content */}
                            <div className="step-content">{renderStepContent()}</div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="onboarding-footer">
                    {/* Step Dots */}
                    <div className="step-dots">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                className={`dot ${index === currentStep ? "active" : ""} ${index < currentStep ? "completed" : ""
                                    }`}
                                style={{
                                    backgroundColor:
                                        index === currentStep
                                            ? currentStepData.color
                                            : index < currentStep
                                                ? currentStepData.color
                                                : undefined,
                                }}
                            />
                        ))}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="nav-buttons">
                        {!isFirstStep && !isLastStep && (
                            <IonButton
                                fill="clear"
                                className="back-btn"
                                onClick={prevStep}
                            >
                                <IonIcon slot="start" icon={arrowBack} />
                                Back
                            </IonButton>
                        )}
                        {isLastStep ? (
                            <IonButton
                                expand="block"
                                className="action-btn"
                                href="/app/dashboard/home"
                                onClick={() => localStorage.setItem("onboarding_completed", "true")}
                                style={{
                                    "--background": currentStepData.color,
                                }}
                            >
                                {actionButton.label}
                            </IonButton>
                        ) : (
                            <IonButton
                                expand={isFirstStep ? "block" : undefined}
                                className="action-btn"
                                onClick={actionButton.action}
                                style={{
                                    "--background": currentStepData.color,
                                }}
                            >
                                {actionButton.label}
                                <IonIcon slot="end" icon={arrowForward} />
                            </IonButton>
                        )}
                    </div>
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

export default OnboardingPage;