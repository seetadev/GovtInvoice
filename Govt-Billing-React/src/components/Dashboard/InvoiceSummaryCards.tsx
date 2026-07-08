import { IonCard, IonCardContent, IonCol, IonGrid, IonRow } from "@ionic/react";

interface SummaryData {
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    collectedAmount: number;
}

interface Props {
    data: SummaryData;
}

const InvoiceSummaryCards: React.FC<Props> = ({ data }) => {
    const cards = [
        { label: "Total Invoices", value: data.total, color: "#3880ff" },
        { label: "Paid", value: data.paid, color: "#2dd36f" },
        { label: "Pending", value: data.pending, color: "#ffc409" },
        { label: "Overdue", value: data.overdue, color: "#eb445a" },
        {
            label: "Total (₹)",
            value: `₹${data.totalAmount.toLocaleString("en-IN")}`,
            color: "#3880ff",
        },
        {
            label: "Collected (₹)",
            value: `₹${data.collectedAmount.toLocaleString("en-IN")}`,
            color: "#2dd36f",
        },
    ];

    return (
        <IonGrid>
            <IonRow>
                {cards.map((c) => (
                    <IonCol key={c.label} size="6" sizeMd="4">
                        <IonCard
                            style={{
                                borderTop: `4px solid ${c.color}`,
                                margin: "6px",
                                borderRadius: "8px",
                            }}
                        >
                            <IonCardContent style={{ textAlign: "center", padding: "12px" }}>
                                <div
                                    style={{
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        color: c.color,
                                    }}
                                >
                                    {c.value}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#888", marginTop: 4 }}>
                                    {c.label}
                                </div>
                            </IonCardContent>
                        </IonCard>
                    </IonCol>
                ))}
            </IonRow>
        </IonGrid>
    );
};

export default InvoiceSummaryCards;