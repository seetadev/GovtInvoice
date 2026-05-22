import {
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonModal,
    IonRow,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { Chart, registerables } from "chart.js";
import { useEffect, useRef } from "react";
import InvoiceSummaryCards from "./InvoiceSummaryCards";

Chart.register(...registerables);

// Sample data — replace with real store reads once invoice data model is finalized
const SAMPLE_INVOICES = [
    { status: "paid", amount: 85000, month: "Jan" },
    { status: "pending", amount: 34580, month: "Jan" },
    { status: "overdue", amount: 47200, month: "Feb" },
    { status: "paid", amount: 120000, month: "Feb" },
    { status: "draft", amount: 15000, month: "Mar" },
    { status: "paid", amount: 62000, month: "Mar" },
    { status: "overdue", amount: 29000, month: "Apr" },
    { status: "pending", amount: 53000, month: "Apr" },
    { status: "paid", amount: 78000, month: "May" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May"];

interface Props {
    showDashboard: boolean;
    setShowDashboard: (val: boolean) => void;
}

const Dashboard: React.FC<Props> = ({ showDashboard, setShowDashboard }) => {
    const donutRef = useRef<HTMLCanvasElement>(null);
    const barRef = useRef<HTMLCanvasElement>(null);
    const donutChart = useRef<Chart | null>(null);
    const barChart = useRef<Chart | null>(null);

    const summaryData = {
        total: SAMPLE_INVOICES.length,
        paid: SAMPLE_INVOICES.filter((i) => i.status === "paid").length,
        pending: SAMPLE_INVOICES.filter((i) => i.status === "pending").length,
        overdue: SAMPLE_INVOICES.filter((i) => i.status === "overdue").length,
        totalAmount: SAMPLE_INVOICES.reduce((s, i) => s + i.amount, 0),
        collectedAmount: SAMPLE_INVOICES.filter((i) => i.status === "paid").reduce(
            (s, i) => s + i.amount,
            0
        ),
    };

    useEffect(() => {
        if (!showDashboard) return;

        // small delay so modal finishes rendering before canvas is available
        const timer = setTimeout(() => {
            if (donutRef.current) {
                donutChart.current?.destroy();
                donutChart.current = new Chart(donutRef.current, {
                    type: "doughnut",
                    data: {
                        labels: ["Paid", "Pending", "Overdue", "Draft"],
                        datasets: [
                            {
                                data: [
                                    summaryData.paid,
                                    summaryData.pending,
                                    summaryData.overdue,
                                    SAMPLE_INVOICES.filter((i) => i.status === "draft").length,
                                ],
                                backgroundColor: ["#2dd36f", "#ffc409", "#eb445a", "#92949c"],
                                borderWidth: 0,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        cutout: "65%",
                        plugins: { legend: { position: "bottom" } },
                    },
                });
            }

            if (barRef.current) {
                barChart.current?.destroy();
                barChart.current = new Chart(barRef.current, {
                    type: "bar",
                    data: {
                        labels: MONTHS,
                        datasets: [
                            {
                                label: "Total (₹)",
                                data: MONTHS.map((m) =>
                                    SAMPLE_INVOICES.filter((i) => i.month === m).reduce(
                                        (s, i) => s + i.amount,
                                        0
                                    )
                                ),
                                backgroundColor: "rgba(56,128,255,0.3)",
                                borderColor: "#3880ff",
                                borderWidth: 2,
                                borderRadius: 4,
                            },
                            {
                                label: "Collected (₹)",
                                data: MONTHS.map((m) =>
                                    SAMPLE_INVOICES.filter(
                                        (i) => i.month === m && i.status === "paid"
                                    ).reduce((s, i) => s + i.amount, 0)
                                ),
                                backgroundColor: "rgba(45,211,111,0.4)",
                                borderColor: "#2dd36f",
                                borderWidth: 2,
                                borderRadius: 4,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { position: "top" } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: (v) => `₹${Number(v).toLocaleString("en-IN")}`,
                                },
                            },
                        },
                    },
                });
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            donutChart.current?.destroy();
            barChart.current?.destroy();
        };
    }, [showDashboard]);

    return (
        <IonModal isOpen={showDashboard} onDidDismiss={() => setShowDashboard(false)}>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>Invoice Analytics</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={() => setShowDashboard(false)}>Close</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent className="ion-padding">
                <InvoiceSummaryCards data={summaryData} />

                <IonGrid>
                    <IonRow>
                        <IonCol size="12" sizeMd="5">
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle style={{ fontSize: "0.95rem" }}>
                                        Status Breakdown
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <canvas ref={donutRef} />
                                </IonCardContent>
                            </IonCard>
                        </IonCol>

                        <IonCol size="12" sizeMd="7">
                            <IonCard>
                                <IonCardHeader>
                                    <IonCardTitle style={{ fontSize: "0.95rem" }}>
                                        Monthly Revenue
                                    </IonCardTitle>
                                </IonCardHeader>
                                <IonCardContent>
                                    <canvas ref={barRef} />
                                </IonCardContent>
                            </IonCard>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </IonContent>
        </IonModal>
    );
};

export default Dashboard;