import React, { useState } from 'react';
import { IonIcon, IonButton, IonSpinner, useIonAlert, isPlatform } from '@ionic/react';
import { App as CapacitorApp } from '@capacitor/app';
import { menuOutline, add, cloudOutline } from 'ionicons/icons';
import { useHistory, useLocation } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import { IpfsCloudModal } from './IpfsCloudModal';

import { localTemplateService } from '../services/local-template-service';
import './DashboardLayout.css';
import { useStatusBar, StatusBarPresets } from '../hooks/useStatusBar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showCloudModal, setShowCloudModal] = useState(false);
    // Theme logic removed
    const history = useHistory();
    const location = useLocation();
    const [presentAlert] = useIonAlert();


    // Configure status bar for dashboard pages
    useStatusBar(StatusBarPresets.light);

    // Handle Hardware Back Button
    React.useEffect(() => {
        const handleBackButton = (ev: any) => {
            ev.detail.register(10, () => {
                if (isSidebarOpen) {
                    setIsSidebarOpen(false);
                } else if (location.pathname === '/app/dashboard/home') {
                    presentAlert({
                        header: 'Exit App',
                        message: 'Are you sure you want to exit?',
                        buttons: [
                            { text: 'Cancel', role: 'cancel' },
                            { text: 'Exit', handler: () => CapacitorApp.exitApp() }
                        ]
                    });
                }
            });
        };

        document.addEventListener('ionBackButton', handleBackButton);
        return () => {
            document.removeEventListener('ionBackButton', handleBackButton);
        };
    }, [isSidebarOpen, location.pathname, presentAlert]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/app/dashboard/home')) return 'Home';
        if (path.includes('/app/dashboard/inventory')) return 'Inventory';
        if (path.includes('/app/dashboard/templates')) return 'Templates';
        if (path.includes('/app/dashboard/business-info')) return 'Business Info';
        if (path.includes('/app/dashboard/jobs')) return 'Jobs';
        if (path.includes('/app/dashboard/settings')) return 'Settings';
        if (path.includes('/app/dashboard/account')) return 'Account';
        return 'Dashboard';
    };

    const handleCreateInvoice = async () => {
        if (isCreating) return;
        setIsCreating(true);

        try {
            // Check 8-file limit
            const canCreate = await localTemplateService.canCreateInvoice();
            if (!canCreate) {
                presentAlert({
                    header: 'File Limit Reached',
                    message: `You can save a maximum of ${localTemplateService.maxInvoices} invoices. Please delete some invoices before creating a new one.`,
                    buttons: ['OK']
                });
                return;
            }

            // Always determine template based on current platform for new invoices
            let templateId: number | string | null = null;

            const templates = await localTemplateService.fetchStoreTemplates(1, 100);
            if (templates.items.length > 0) {
                const mobile = templates.items.find(t => t.device === 'mobile');
                const tablet = templates.items.find(t => t.device === 'tablet');

                // Platform detection logic
                const isTabletDevice = isPlatform('tablet') || isPlatform('ipad') || (window.innerWidth >= 768);

                if (isTabletDevice && tablet) {
                    templateId = tablet.id;
                } else if (mobile) {
                    // Default to mobile for phones or fallback
                    templateId = mobile.id;
                } else {
                    // Fallback to first available if specific platform template missing
                    templateId = templates.items[0].id;
                }
            }

            if (templateId) {
                await localTemplateService.setActiveTemplateId(templateId);
                history.push(`/app/editor/invoice?template=${templateId}`);
            } else {
                console.error('No suitable template found for platform');
            }
        } catch (error) {
            console.error('Error creating invoice:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleImportSuccess = (importedFileName: string) => {
        setShowCloudModal(false);
        window.location.reload();
    };

    return (
        <div className="dashboard-container">
            {/* Header at top level */}
            <header className="dashboard-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonButton fill="clear" onClick={toggleSidebar} className="ion-hide-lg-up">
                        <IonIcon icon={menuOutline} slot="icon-only" />
                    </IonButton>
                    <div style={{ display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
                        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>{getPageTitle()}</h1>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <IonButton
                        fill="clear"
                        color="primary"
                        onClick={() => setShowCloudModal(true)}
                        style={{
                            height: '36px',
                            marginRight: '8px',
                            '--padding-start': '8px',
                            '--padding-end': '8px',
                        }}
                        title="IPFS Cloud Manager"
                    >
                        <IonIcon icon={cloudOutline} style={{ fontSize: '22px' }} />
                    </IonButton>
                    <IonButton
                        fill="solid"
                        color="primary"
                        onClick={handleCreateInvoice}
                        disabled={isCreating}
                        style={{
                            height: '36px',
                            fontSize: '14px',
                            textTransform: 'none',
                            '--padding-start': '12px',
                            '--padding-end': '16px',
                            '--border-radius': '8px',
                            fontWeight: 500
                        }}
                    >
                        {isCreating ? (
                            <IonSpinner name="crescent" style={{ width: '20px', height: '20px' }} />
                        ) : (
                          <>
                                <IonIcon icon={add} slot="start" style={{ fontSize: '18px', marginRight: '4px' }} />
                                Create
                          </>
                        )}
                    </IonButton>
                </div>
            </header>

            {/* Main body area below header */}
            <div className="dashboard-body">
                {/* Mobile Overlay */}
                {isSidebarOpen && window.innerWidth < 1024 && (
                    <div className="dashboard-overlay" onClick={() => setIsSidebarOpen(false)} />
                )}

                <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

                <main className="dashboard-content">
                    {children}
                </main>
            </div>

            <IpfsCloudModal
                isOpen={showCloudModal}
                onClose={() => setShowCloudModal(false)}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default DashboardLayout;
