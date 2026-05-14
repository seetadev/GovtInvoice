import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonFab,
  IonFabButton,
  IonIcon,
  IonToast,
} from "@ionic/react";
import { addOutline } from "ionicons/icons";
import InvoiceCard, { Invoice, InvoiceStatus } from "../components/InvoiceCard";
import "./InvoiceListPage.css";


const SAMPLE_INVOICES: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "GVT-2024-001",
    recipientName: "Ramesh Kumar",
    recipientOrg: "Delhi Public School",
    amount: 85000,
    currency: "INR",
    issueDate: "01 May 2024",
    dueDate: "31 May 2024",
    status: "paid",
    ipfsHash: "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
  },
  {
    id: "2",
    invoiceNumber: "GVT-2024-002",
    recipientName: "Priya Sharma",
    recipientOrg: "NSUT Administration",
    amount: 124500,
    currency: "INR",
    issueDate: "10 May 2024",
    dueDate: "10 Jun 2024",
    status: "pending",
  },
  {
    id: "3",
    invoiceNumber: "GVT-2024-003",
    recipientName: "Anjali Mehta",
    recipientOrg: "MCD Ward Office",
    amount: 47200,
    currency: "INR",
    issueDate: "15 Mar 2024",
    dueDate: "15 Apr 2024",
    status: "overdue",
    ipfsHash: "bafkreihdwdcefgh4r5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z",
  },
  {
    id: "4",
    invoiceNumber: "GVT-2024-004",
    recipientName: "Suresh Nair",
    recipientOrg: "Kerala State Education Dept",
    amount: 210000,
    currency: "INR",
    issueDate: "12 May 2024",
    dueDate: "12 Jun 2024",
    status: "draft",
  },
];

type FilterTab = "all" | InvoiceStatus;

const InvoiceListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);


  const filtered = SAMPLE_INVOICES.filter((inv) => {
    const matchesTab = activeTab === "all" || inv.status === activeTab;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.recipientName.toLowerCase().includes(q) ||
      inv.recipientOrg.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const handleView = (invoice: Invoice) => {
    setToastMessage(`Opening invoice #${invoice.invoiceNumber}`);
    setShowToast(true);
  };

  const handleExport = (invoice: Invoice) => {
    setToastMessage(`Exporting #${invoice.invoiceNumber} as HTML/CSV…`);
    setShowToast(true);
    
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Invoices</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="invoice-list-content">
        {/* Search */}
        <IonSearchbar
          value={search}
          onIonInput={(e) => setSearch(e.detail.value ?? "")}
          placeholder="Search by name, org, or invoice #"
          className="invoice-list__searchbar"
        />

        {/* Status filter tabs */}
        <IonSegment
          value={activeTab}
          onIonChange={(e) => setActiveTab(e.detail.value as FilterTab)}
          className="invoice-list__segment"
        >
          <IonSegmentButton value="all">
            <IonLabel>All</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="paid">
            <IonLabel>Paid</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="pending">
            <IonLabel>Pending</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="overdue">
            <IonLabel>Overdue</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="draft">
            <IonLabel>Draft</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* Invoice cards */}
        {filtered.length > 0 ? (
          filtered.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={invoice}
              onView={handleView}
              onExport={handleExport}
            />
          ))
        ) : (
          <div className="invoice-list__empty">
            <p>No invoices found.</p>
          </div>
        )}

        {/* FAB — create new invoice */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary">
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Toast feedback */}
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setShowToast(false)}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default InvoiceListPage;