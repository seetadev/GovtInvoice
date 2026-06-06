import React, { useState, useEffect } from 'react';
import {
    IonContent,
    IonPage,
    IonSpinner,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonIcon,
} from '@ionic/react';
import { documentTextOutline, walletOutline } from 'ionicons/icons';

import { useInvoice } from '../contexts/InvoiceContext';

import { parseInvoiceData, InvoiceAnalytics } from '../utils/invoiceAnalytics';
import { localTemplateService } from '../services/local-template-service';
import Files from '../components/Files/Files';

const DashboardHome: React.FC = () => {

    const { selectedFile, updateSelectedFile, updateBillType, currency } = useInvoice();


    const [analytics, setAnalytics] = useState<InvoiceAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    // Load data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Fetch all local invoices directly
            const allFiles = await localTemplateService.getSavedInvoices();



            // Calculate analytics from the same files source
            let data = parseInvoiceData(allFiles);

            setAnalytics(data);
        } catch (error) {
            console.error("Error loading dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

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
                <div className="dashboard-home-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', paddingTop: '24px' }}>

                    {/* Stats Section */}
                    <IonGrid className="ion-no-padding" style={{ marginBottom: '24px' }}>
                        <IonRow>
                            <IonCol size="6">
                                <IonCard style={{ margin: '0 8px 0 0', height: '100%', boxShadow: 'none', border: '1px solid var(--ion-color-step-150, #e0e0e0)' }}>
                                    <IonCardHeader>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <IonCardSubtitle style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em' }}>Total Invoices</IonCardSubtitle>
                                            <IonIcon icon={documentTextOutline} style={{ fontSize: '20px', color: 'var(--ion-color-primary)', opacity: 0.8 }} />
                                        </div>
                                        <IonCardTitle style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
                                            {analytics?.totalInvoices || 0}
                                        </IonCardTitle>
                                    </IonCardHeader>
                                </IonCard>
                            </IonCol>
                            <IonCol size="6">
                                <IonCard style={{ margin: '0 0 0 8px', height: '100%', boxShadow: 'none', border: '1px solid var(--ion-color-step-150, #e0e0e0)' }}>
                                    <IonCardHeader>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <IonCardSubtitle style={{ textTransform: 'uppercase', fontSize: '11px', fontWeight: '600', letterSpacing: '0.05em' }}>Total Revenue</IonCardSubtitle>
                                            <IonIcon icon={walletOutline} style={{ fontSize: '20px', color: 'var(--ion-color-success)', opacity: 0.8 }} />
                                        </div>
                                        <IonCardTitle style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
                                            {new Intl.NumberFormat(undefined, {
                                                style: 'currency',
                                                currency: currency || 'INR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0
                                            }).format(analytics?.totalRevenue || 0)}
                                        </IonCardTitle>
                                    </IonCardHeader>
                                </IonCard>
                            </IonCol>
                        </IonRow>
                    </IonGrid>



                    {/* Invoice List */}
                    <div style={{ marginTop: "24px" }}>
                        <Files
                            file={selectedFile}
                            updateSelectedFile={updateSelectedFile}
                            updateBillType={updateBillType}
                            onDataChange={loadData}
                        />
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default DashboardHome;
