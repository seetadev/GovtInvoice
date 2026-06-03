import React from "react";
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonBadge,
  IonIcon,
  IonButton,
  IonChip,
  IonLabel,
} from "@ionic/react";
import {
  documentTextOutline,
  calendarOutline,
  personOutline,
  cashOutline,
  downloadOutline,
  eyeOutline,
} from "ionicons/icons";
import "./InvoiceCard.css";

export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  recipientName: string;
  recipientOrg: string;
  amount: number;
  currency?: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  ipfsHash?: string; // Filecoin/IPFS CID if stored on-chain
}

interface InvoiceCardProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onExport?: (invoice: Invoice) => void;
}

const STATUS_CONFIG: Record<
  InvoiceStatus,
  { label: string; color: string }
> = {
  paid: { label: "Paid", color: "success" },
  pending: { label: "Pending", color: "warning" },
  overdue: { label: "Overdue", color: "danger" },
  draft: { label: "Draft", color: "medium" },
};

const InvoiceCard: React.FC<InvoiceCardProps> = ({
  invoice,
  onView,
  onExport,
}) => {
  const {
    invoiceNumber,
    recipientName,
    recipientOrg,
    amount,
    currency = "INR",
    issueDate,
    dueDate,
    status,
    ipfsHash,
  } = invoice;

  const { label, color } = STATUS_CONFIG[status];

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <IonCard className="invoice-card">
      {/* Header row: Invoice number + status badge */}
      <IonCardHeader className="invoice-card__header">
        <div className="invoice-card__header-row">
          <div className="invoice-card__icon-wrap">
            <IonIcon icon={documentTextOutline} className="invoice-card__doc-icon" />
          </div>
          <div className="invoice-card__title-wrap">
            <p className="invoice-card__number">#{invoiceNumber}</p>
            <p className="invoice-card__org">{recipientOrg}</p>
          </div>
          <IonBadge color={color} className="invoice-card__badge">
            {label}
          </IonBadge>
        </div>
      </IonCardHeader>

      <IonCardContent className="invoice-card__content">
        {/* Recipient */}
        <div className="invoice-card__row">
          <IonIcon icon={personOutline} className="invoice-card__row-icon" />
          <span className="invoice-card__row-label">Bill To</span>
          <span className="invoice-card__row-value">{recipientName}</span>
        </div>

        {/* Amount */}
        <div className="invoice-card__row">
          <IonIcon icon={cashOutline} className="invoice-card__row-icon" />
          <span className="invoice-card__row-label">Amount</span>
          <span className={`invoice-card__amount invoice-card__amount--${status}`}>
            {formattedAmount}
          </span>
        </div>

        {/* Issue Date */}
        <div className="invoice-card__row">
          <IonIcon icon={calendarOutline} className="invoice-card__row-icon" />
          <span className="invoice-card__row-label">Issued</span>
          <span className="invoice-card__row-value">{issueDate}</span>
        </div>

        {/* Due Date */}
        <div className="invoice-card__row">
          <IonIcon icon={calendarOutline} className="invoice-card__row-icon" />
          <span className="invoice-card__row-label">Due</span>
          <span
            className={`invoice-card__row-value ${
              status === "overdue" ? "invoice-card__overdue-text" : ""
            }`}
          >
            {dueDate}
          </span>
        </div>

        {/* IPFS chip — shown only if stored on-chain */}
        {ipfsHash && (
          <div className="invoice-card__ipfs-row">
            <IonChip color="tertiary" className="invoice-card__ipfs-chip">
              <IonLabel>
                🔗 IPFS: {ipfsHash.slice(0, 10)}…{ipfsHash.slice(-4)}
              </IonLabel>
            </IonChip>
          </div>
        )}

        {/* Action Buttons */}
        <div className="invoice-card__actions">
          <IonButton
            fill="outline"
            size="small"
            color="primary"
            onClick={() => onView?.(invoice)}
          >
            <IonIcon slot="start" icon={eyeOutline} />
            View
          </IonButton>
          <IonButton
            fill="outline"
            size="small"
            color="secondary"
            onClick={() => onExport?.(invoice)}
          >
            <IonIcon slot="start" icon={downloadOutline} />
            Export
          </IonButton>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default InvoiceCard;