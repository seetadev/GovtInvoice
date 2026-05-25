import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonToast,
  IonButtons,
  IonText,
} from "@ionic/react";
import {
  documentOutline,
  downloadOutline,
  printOutline,
  closeOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useInvoicePDF } from "../../hooks/useInvoicePDF";

interface InvoicePDFModalProps {
  show: boolean;
  setShow: (val: boolean) => void;
  filename: string;
}

const InvoicePDFModal: React.FC<InvoicePDFModalProps> = ({
  show,
  setShow,
  filename,
}) => {
  const { exportAsPDF, downloadHTML } = useInvoicePDF();
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  const handleExportPDF = () => {
    // iframe-based print — no popup blocker issues, no try/catch needed
    exportAsPDF(filename);
    setToastMessage("Print dialog opening — choose 'Save as PDF' as destination.");
    setShowToast(true);
    setShow(false);
  };

  const handleDownloadHTML = () => {
    try {
      downloadHTML(filename);
      setToastMessage("Invoice downloaded as HTML file.");
      setShowToast(true);
      setShow(false);
    } catch {
      setToastMessage("Download failed. Please try again.");
      setShowToast(true);
    }
  };

  return (
    <>
      <IonModal isOpen={show} onDidDismiss={() => setShow(false)}>
        <IonHeader>
          <IonToolbar color="primary">
            <IonTitle>Export Invoice as PDF</IonTitle>
            <IonButtons slot="end">
              <IonButton onClick={() => setShow(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonItem lines="none" className="ion-margin-bottom">
            <IonIcon icon={documentOutline} slot="start" color="primary" />
            <IonLabel>
              <h2>Current Invoice</h2>
              <p>{filename}</p>
            </IonLabel>
          </IonItem>

          <IonText color="medium">
            <p className="ion-padding-horizontal ion-padding-bottom">
              Choose how you want to export this invoice. Both options include a
              formatted header with the invoice name and export timestamp.
            </p>
          </IonText>

          <IonList inset>
            <IonItem button detail onClick={handleExportPDF} lines="full">
              <IonIcon icon={printOutline} slot="start" color="primary" />
              <IonLabel>
                <h2>Export as PDF</h2>
                <p>Opens print dialog — set destination to "Save as PDF"</p>
              </IonLabel>
            </IonItem>

            <IonItem button detail onClick={handleDownloadHTML} lines="none">
              <IonIcon icon={downloadOutline} slot="start" color="secondary" />
              <IonLabel>
                <h2>Download as HTML</h2>
                <p>Self-contained file — open in any browser or email as attachment</p>
              </IonLabel>
            </IonItem>
          </IonList>

          <IonItem lines="none" className="ion-margin-top">
            <IonIcon icon={checkmarkCircleOutline} slot="start" color="success" />
            <IonLabel className="ion-text-wrap">
              <p>
                <strong>Tip:</strong> In the print dialog, set "Destination" to
                "Save as PDF" and disable headers/footers for the cleanest output.
              </p>
            </IonLabel>
          </IonItem>

          <IonButton
            expand="block"
            fill="outline"
            color="medium"
            className="ion-margin-top"
            onClick={() => setShow(false)}
          >
            Cancel
          </IonButton>
        </IonContent>
      </IonModal>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />
    </>
  );
};

export default InvoicePDFModal;