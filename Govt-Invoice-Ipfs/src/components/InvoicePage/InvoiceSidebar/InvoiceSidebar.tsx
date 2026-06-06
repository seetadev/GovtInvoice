import React, { useState, useEffect } from "react";
import {
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonSearchbar,
} from "@ionic/react";
import {
    close,
    businessOutline,
    cubeOutline,
    imageOutline,
    addCircleOutline,
    alertCircleOutline,
    banOutline,
} from "ionicons/icons";
import {
    businessInfoRepository,
    customerRepository,
    inventoryRepository,
} from "../../../data";

import { useInvoice } from "../../../contexts/InvoiceContext";
import "./InvoiceSidebar.css";

interface InvoiceSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyAddress: (address: any) => void;
    onApplyInventory: (item: any, quantity?: number) => void;
    onApplyLogo: (logo: any) => void;
    onApplySignature: (signature: any) => void;
    side?: 'start' | 'end';
}

const InvoiceSidebar: React.FC<InvoiceSidebarProps> = ({
    isOpen,
    onClose,
    onApplyAddress,
    onApplyInventory,
    onApplyLogo,
    onApplySignature,
    side = 'end',
}) => {

    const { currency } = useInvoice();
    const [activeSegment, setActiveSegment] = useState<"info" | "inventory">("info");
    const [searchText, setSearchText] = useState("");

    // Data States
    const [addresses, setAddresses] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [inventory, setInventory] = useState<any[]>([]);
    const [logos, setLogos] = useState<any[]>([]);
    const [signatures, setSignatures] = useState<any[]>([]);
    const [quantities, setQuantities] = useState<Record<string, number>>({});


    // Load data when sidebar opens
    useEffect(() => {
        if (isOpen) {
            loadData();
        }
    }, [isOpen, activeSegment]);

    const loadData = async () => {
        try {
            if (activeSegment === "info") {
                const [addr, cust, l, s] = await Promise.all([
                    businessInfoRepository.getAllAddresses(),
                    customerRepository.getAll(),
                    businessInfoRepository.getAllLogos(),
                    businessInfoRepository.getAllSignatures(),
                ]);
                setAddresses(addr);
                setCustomers(cust);
                setLogos(l);
                setSignatures(s);
            } else if (activeSegment === "inventory") {
                const inv = await inventoryRepository.getAll();
                setInventory(inv);
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    // Filter Logic
    const filteredAddresses = addresses.filter((a) =>
        (a.label || "").toLowerCase().includes(searchText.toLowerCase())
    );
    const filteredCustomers = customers.filter((c) =>
        (c.name || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchText.toLowerCase()) ||
        (c.phone || "").toLowerCase().includes(searchText.toLowerCase())
    );
    const filteredInventory = inventory.filter((i) =>
        (i.name || "").toLowerCase().includes(searchText.toLowerCase())
    );

    // Format price with currency
    const formatPrice = (price: number) => {
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency: currency || 'USD',
            }).format(price);
        } catch {
            return `$${price.toFixed(2)}`;
        }
    };

    return (
        <div className={`quick-insert-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-backdrop" onClick={onClose} />

            <div className="sidebar-content">
                {/* Header */}
                <div className="sidebar-header">
                    <h2 className="sidebar-title">Quick Insert</h2>
                    <div className="sidebar-actions">
                        <IonButton onClick={onClose} fill="clear" color="medium">
                            <IonIcon icon={close} slot="icon-only" />
                        </IonButton>
                    </div>
                </div>

                {/* Tabs */}
                <div className="sidebar-tabs">
                    <IonSegment
                        value={activeSegment}
                        onIonChange={(e) => setActiveSegment(e.detail.value as any)}
                        color="primary"
                    >
                        <IonSegmentButton value="info">
                            <IonIcon icon={businessOutline} />
                            <IonLabel>Info</IonLabel>
                        </IonSegmentButton>
                        <IonSegmentButton value="inventory">
                            <IonIcon icon={cubeOutline} />
                            <IonLabel>Items</IonLabel>
                        </IonSegmentButton>
                    </IonSegment>
                </div>

                {/* Scrollable Content */}
                <div className="sidebar-scrollable-content">
                    {/* INFO VIEW - Logos + Signatures + Addresses */}
                    {activeSegment === "info" && (
                        <div>
                            {/* Logos Section */}
                            <div className="section-header">
                                <IonIcon icon={imageOutline} />
                                <span>Logos</span>
                                <button
                                    className="section-remove-btn"
                                    onClick={() => onApplyLogo("")}
                                >
                                    Remove
                                </button>
                            </div>
                            {logos.length > 0 ? (
                                <div className="assets-grid assets-grid-compact">
                                    {logos.map((logo) => (
                                        <div
                                            key={logo.id}
                                            className="asset-card asset-card-compact"
                                            onClick={() => onApplyLogo(logo)}
                                        >
                                            <div className="asset-image-container">
                                                <img src={logo.data} alt={logo.name} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-inline">
                                    <p>Add logos in Business Info</p>
                                </div>
                            )}

                            {/* Signatures Section */}
                            <div className="section-header" style={{ marginTop: '16px' }}>
                                <IonIcon icon={imageOutline} />
                                <span>Signatures</span>
                                <button
                                    className="section-remove-btn"
                                    onClick={() => onApplySignature("")}
                                >
                                    Remove
                                </button>
                            </div>
                            {signatures.length > 0 ? (
                                <div className="assets-grid assets-grid-compact">
                                    {signatures.map((sig) => (
                                        <div
                                            key={sig.id}
                                            className="asset-card asset-card-compact"
                                            onClick={() => onApplySignature(sig)}
                                        >
                                            <div className="asset-image-container">
                                                <img src={sig.data} alt={sig.name} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-state-inline">
                                    <p>Add signatures in Business Info</p>
                                </div>
                            )}

                            {/* Addresses Section - Company Only */}
                            <div className="section-header" style={{ marginTop: '16px' }}>
                                <IonIcon icon={businessOutline} />
                                <span>Addresses</span>
                            </div>

                            <IonList lines="none" className="sidebar-list">
                                {addresses.length > 0 ? (
                                    addresses.map((addr) => (
                                        <IonItem
                                            button
                                            key={addr.id}
                                            detail={false}
                                            onClick={() => onApplyAddress(addr)}
                                        >
                                            <IonLabel>
                                                <h2>{addr.label}</h2>
                                                <p>{addr.streetAddress}, {addr.cityStateZip}</p>
                                            </IonLabel>
                                            <IonButton fill="clear" slot="end" className="add-btn">
                                                <IonIcon icon={addCircleOutline} slot="start" />
                                                Add
                                            </IonButton>
                                        </IonItem>
                                    ))
                                ) : (
                                    <div className="empty-state-inline">
                                        <p>Add addresses in Business Info</p>
                                    </div>
                                )}
                            </IonList>

                            {/* Extra padding at bottom */}
                            <div style={{ height: '40px' }}></div>
                        </div>
                    )}

                    {/* INVENTORY VIEW */}
                    {activeSegment === "inventory" && (
                        <div>
                            {/* Search */}
                            <div className="search-container">
                                <IonSearchbar
                                    value={searchText}
                                    onIonInput={(e) => setSearchText(e.detail.value!)}
                                    placeholder="Search items..."
                                    debounce={250}
                                />
                            </div>

                            <IonList lines="none" className="sidebar-list">
                                {filteredInventory.length > 0 ? (
                                    filteredInventory.map((item) => {
                                        // Local quantity state for this item (default 1)
                                        const qty = quantities[item.id] || 1;

                                        const updateQty = (id: string, delta: number) => {
                                            setQuantities(prev => {
                                                const current = prev[id] || 1;
                                                const newVal = Math.max(1, current + delta);
                                                return { ...prev, [id]: newVal };
                                            });
                                        };

                                        return (
                                            <IonItem
                                                button={false}
                                                key={item.id}
                                                detail={false}
                                                className="inventory-item"
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <IonLabel>
                                                        <h2>{item.name}</h2>
                                                        <p>
                                                            <span className="price-tag">
                                                                {formatPrice(item.price || 0)}
                                                            </span>
                                                        </p>
                                                    </IonLabel>
                                                </div>

                                                <div className="qty-controls" slot="end" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        background: 'var(--ion-color-light)',
                                                        borderRadius: '20px',
                                                        padding: '2px'
                                                    }}>
                                                        <IonButton
                                                            fill="clear"
                                                            size="small"
                                                            style={{ margin: 0, height: '28px', width: '28px', '--padding-start': '0', '--padding-end': '0' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateQty(item.id, -1);
                                                            }}
                                                        >
                                                            -
                                                        </IonButton>
                                                        <span style={{ margin: '0 4px', fontSize: '13px', minWidth: '20px', textAlign: 'center', fontWeight: 600 }}>{qty}</span>
                                                        <IonButton
                                                            fill="clear"
                                                            size="small"
                                                            style={{ margin: 0, height: '28px', width: '28px', '--padding-start': '0', '--padding-end': '0' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                updateQty(item.id, 1);
                                                            }}
                                                        >
                                                            +
                                                        </IonButton>
                                                    </div>

                                                    <IonButton
                                                        fill="clear"
                                                        className="add-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onApplyInventory(item, qty);
                                                        }}
                                                    >
                                                        <IonIcon icon={addCircleOutline} slot="start" />
                                                        Add
                                                    </IonButton>
                                                </div>
                                            </IonItem>
                                        );
                                    })
                                ) : (
                                    <div className="empty-state">
                                        <IonIcon icon={alertCircleOutline} />
                                        <p>No inventory items found</p>
                                    </div>
                                )}
                            </IonList>
                        </div>
                    )}
                </div>
            </div >
        </div >
    );
};

export default InvoiceSidebar;
