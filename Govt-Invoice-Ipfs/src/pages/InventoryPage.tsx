import React, { useState, useEffect } from "react";
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    IonModal,
    IonToast,
    IonSpinner,
    IonToggle
} from "@ionic/react";
import { add, trash, createOutline, cubeOutline, searchOutline, infiniteOutline, infinite, cashOutline } from "ionicons/icons";

import { useInvoice } from "../contexts/InvoiceContext";
import { inventoryRepository, InventoryItem } from "../data";
import "./SettingsPage.css"; // Reuse existing styles for consistency

const InventoryPage: React.FC = () => {
    // const { isDarkMode } = useTheme(); // Theme logic removed
    const { currency } = useInvoice();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [searchText, setSearchText] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState<Partial<InventoryItem>>({
        name: "",
        description: "",
        price: 0,
    });

    useEffect(() => {
        const loadItems = async () => {
            try {
                const savedItems = await inventoryRepository.getAll();
                setItems(savedItems);
            } catch (e) {
                console.error("Failed to load inventory items", e);
            }
            setLoading(false);
        };

        loadItems();
    }, []);

    const handleOpenModal = (item?: InventoryItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({ ...item, isInfiniteStock: item.isInfiniteStock || false });
        } else {
            setEditingItem(null);
            setFormData({ name: "", description: "", price: 0 });
        }
        setShowModal(true);
    };



    const handleSave = async () => {
        if (!formData.name) {
            setToastMessage("Name is required");
            setShowToast(true);
            return;
        }

        const newItem: InventoryItem = {
            id: editingItem ? editingItem.id : Date.now().toString(),
            name: formData.name,
            description: formData.description || "",
            price: Number(formData.price) || 0,
            stock: 0,
            isInfiniteStock: false
        };

        const success = await inventoryRepository.save(newItem);

        if (success) {
            // Reload items from database
            const updatedItems = await inventoryRepository.getAll();
            setItems(updatedItems);
            setToastMessage(editingItem ? "Item updated" : "Item added");
        } else {
            setToastMessage("Failed to save item");
        }

        setShowModal(false);
        setShowToast(true);
    };

    const handleDelete = async (id: string) => {
        const success = await inventoryRepository.delete(id);

        if (success) {
            // Reload items from database
            const updatedItems = await inventoryRepository.getAll();
            setItems(updatedItems);
            setToastMessage("Item deleted");
        } else {
            setToastMessage("Failed to delete item");
        }
        setShowToast(true);
    };

    const filteredItems = items.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.description.toLowerCase().includes(searchText.toLowerCase())
    );

    if (loading) {
        return (
            <IonPage>
                <IonContent fullscreen className="ion-padding">
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <IonSpinner />
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonContent fullscreen>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', paddingBottom: '80px', paddingTop: '24px' }}>

                    {/* Stats Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                    }}>
                        <div style={{
                            padding: '24px',
                            background: '#ffffff',
                            borderRadius: '16px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{
                                    padding: '8px',
                                    borderRadius: '8px',
                                    background: '#eff6ff',
                                    color: '#3b82f6',
                                    display: 'flex',
                                    marginRight: '12px'
                                }}>
                                    <IonIcon icon={cubeOutline} style={{ fontSize: '20px' }} />
                                </div>
                                <div style={{ color: 'var(--ion-color-medium)', fontSize: '14px', fontWeight: 500 }}>Total Items</div>
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a' }}>{items.length}</div>
                        </div>


                    </div>


                    {/* Search and Action Bar */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            background: '#ffffff',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            transition: 'border-color 0.2s ease',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <IonIcon icon={searchOutline} style={{ color: 'var(--ion-color-medium)', marginRight: '12px', fontSize: '20px' }} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    width: '100%',
                                    padding: '14px 0',
                                    outline: 'none',
                                    color: 'inherit',
                                    fontSize: '15px'
                                }}
                            />
                        </div>
                        <IonButton
                            color="primary"
                            onClick={() => handleOpenModal()}
                            style={{
                                height: '50px',
                                margin: 0,
                                '--box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                '--border-radius': '12px',
                                textTransform: 'none',
                                fontSize: '15px',
                                fontWeight: 600
                            }}
                        >
                            <IonIcon slot="start" icon={add} />
                            Add Item
                        </IonButton>
                    </div>

                    {/* Items List */}
                    <div style={{
                        overflowX: 'auto',
                        background: '#ffffff',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        {filteredItems.length === 0 ? (
                            <div style={{
                                padding: "40px 20px",
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                textAlign: 'center'
                            }}>
                                <IonIcon icon={cubeOutline} style={{ fontSize: '48px', marginBottom: '16px', color: '#cbd5e1' }} />
                                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                                    {items.length === 0 ? "No inventory items" : "No results found"}
                                </h3>
                                <p style={{ margin: '0', color: '#64748b' }}>
                                    {items.length === 0 ? "Add your first item to get started." : "Try adjusting your search terms."}
                                </p>
                            </div>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Name</th>
                                        <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Description</th>
                                        <th style={{ padding: '16px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Price</th>
                                        <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredItems.map(item => (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'background-color 0.1s ease'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#f8fafc';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '15px' }}>{item.name}</div>
                                            </td>
                                            <td style={{ padding: '16px', maxWidth: '200px' }}>
                                                <div style={{ fontSize: '14px', color: '#64748b', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxWidth: '300px' }}>
                                                    {item.description ? (item.description.length > 100 ? item.description.substring(0, 100) + '...' : item.description) : '-'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 500, color: '#0f172a' }}>
                                                {new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(item.price)}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                    <div
                                                        onClick={() => handleOpenModal(item)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: '#3b82f6',
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: '#eff6ff',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                    >
                                                        <IonIcon icon={createOutline} style={{ fontSize: '18px' }} />
                                                    </div>
                                                    <div
                                                        onClick={() => handleDelete(item.id)}
                                                        style={{
                                                            cursor: 'pointer',
                                                            color: '#ef4444',
                                                            padding: '8px',
                                                            borderRadius: '6px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            background: '#fef2f2',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                    >
                                                        <IonIcon icon={trash} style={{ fontSize: '18px' }} />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Add/Edit Modal */}
                <IonModal
                    isOpen={showModal}
                    onDidDismiss={() => setShowModal(false)}
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
                            <h3 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.01em', color: '#0f172a' }}>{editingItem ? 'Edit Item' : 'New Inventory Item'}</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                style={{
                                    background: '#f1f5f9',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '10px',
                                    color: '#64748b',
                                    transition: 'all 0.2s'
                                }}
                            >×</button>
                        </div>

                        <div style={{ padding: '24px', background: '#ffffff', overflowY: 'auto', flex: 1 }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Name Input */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-medium)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Item Name</label>
                                    <div style={{ position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ion-color-medium)', display: 'flex' }}>
                                            <IonIcon icon={cubeOutline} style={{ fontSize: '18px' }} />
                                        </div>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="settings-number-input"
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                padding: '12px 16px 12px 42px',
                                                borderRadius: '12px',
                                                fontSize: '15px',
                                                background: '#f8fafc',
                                                borderColor: '#e2e8f0',
                                                color: '#0f172a'
                                            }}
                                            placeholder="Enter Item Name"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px' }}>
                                    {/* Price Input */}
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-medium)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Price</label>
                                        <div style={{ position: 'relative' }}>
                                            <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--ion-color-medium)', fontWeight: 'bold' }}>{(0).toLocaleString(undefined, { style: 'currency', currency: currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim()}</div>
                                            <input
                                                type="number"
                                                value={formData.price}
                                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                                className="settings-number-input"
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '12px 16px 12px 32px',
                                                    borderRadius: '12px',
                                                    fontSize: '15px',
                                                    background: '#f8fafc',
                                                    borderColor: '#e2e8f0',
                                                    color: '#0f172a'
                                                }}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, display: 'none' }}></div>
                                </div>

                                {/* Description Input */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--ion-color-medium)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>Description</label>
                                        <span style={{ fontSize: '12px', color: 'var(--ion-color-medium)', fontWeight: 500 }}>
                                            {(formData.description || "").length}/100
                                        </span>
                                    </div>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        maxLength={100}
                                        className="settings-number-input"
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            minHeight: '100px',
                                            resize: 'none',
                                            padding: '12px 16px',
                                            borderRadius: '12px',
                                            fontSize: '15px',
                                            background: '#f8fafc',
                                            borderColor: '#e2e8f0',
                                            color: '#0f172a',
                                            lineHeight: '1.5'
                                        }}
                                        placeholder="Add details about this item..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="signature-actions" style={{ padding: '20px 24px', gap: '12px', borderTop: '1px solid #f1f5f9', background: '#ffffff', marginTop: 0, flexShrink: 0 }}>
                            <IonButton
                                fill="clear"
                                onClick={() => setShowModal(false)}
                                style={{
                                    flex: 1,
                                    minHeight: '48px',
                                    '--border-radius': '12px',
                                    fontWeight: 600,
                                    color: 'var(--ion-color-medium)',
                                    textTransform: 'none'
                                }}
                            >
                                Cancel
                            </IonButton>
                            <IonButton
                                onClick={handleSave}
                                color="primary"
                                style={{
                                    flex: 1,
                                    minHeight: '48px',
                                    '--border-radius': '12px',
                                    fontWeight: 600,
                                    '--box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                    textTransform: 'none'
                                }}
                            >
                                {editingItem ? 'Save Changes' : 'Create Item'}
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
                    color={toastMessage.toLowerCase().includes("deleted") ? "danger" : "success"}
                />
            </IonContent>
        </IonPage >
    );
};

export default InventoryPage;
