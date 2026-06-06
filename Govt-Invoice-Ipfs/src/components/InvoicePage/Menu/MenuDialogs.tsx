import React from "react";
import { IonAlert, IonToast, IonLoading } from "@ionic/react";

interface MenuDialogsProps {
  // Alert states
  showAlert1: boolean;
  showAlert2: boolean;
  showAlert3: boolean;
  showAlert4: boolean;
  showAlert6: boolean;
  showAlert7: boolean;
  showAlert8: boolean;
  showAlert9: boolean;
  showAlert10: boolean;

  // Alert setters
  setShowAlert1: (show: boolean) => void;
  setShowAlert2: (show: boolean) => void;
  setShowAlert3: (show: boolean) => void;
  setShowAlert4: (show: boolean) => void;
  setShowAlert6: (show: boolean) => void;
  setShowAlert7: (show: boolean) => void;
  setShowAlert8: (show: boolean) => void;
  setShowAlert9: (show: boolean) => void;
  setShowAlert10: (show: boolean) => void;

  // Toast states
  showToast1: boolean;
  setShowToast1: (show: boolean) => void;
  toastMessage: string;
  setToastMessage: (message: string) => void;

  // Loading states
  isGeneratingPDF: boolean;
  isGeneratingCSV: boolean;
  isExportingAllPDF: boolean;
  setIsGeneratingPDF: (loading: boolean) => void;
  setIsGeneratingCSV: (loading: boolean) => void;
  setIsExportingAllPDF: (loading: boolean) => void;

  // Progress messages
  pdfProgress: string;
  exportAllProgress: string;

  // Data for dialogs
  selectedFile: string;
  filePassword: string;

  // Handlers
  doGeneratePDF: (filename: string) => void;
  doGenerateCSV: (filename: string) => void;
  doExportAllSheetsAsPDF: (filename: string) => void;
  generateInvoiceFilename: () => string;
  selectInputText: (inputElement: HTMLIonInputElement) => void;
  invoiceId?: string | null;
}

const MenuDialogs: React.FC<MenuDialogsProps> = ({
  // Alert states
  showAlert1,
  showAlert2,
  showAlert3,
  showAlert4,
  showAlert6,
  showAlert7,
  showAlert8,
  showAlert9,
  showAlert10,

  // Alert setters
  setShowAlert1,
  setShowAlert2,
  setShowAlert3,
  setShowAlert4,
  setShowAlert6,
  setShowAlert7,
  setShowAlert8,
  setShowAlert9,
  setShowAlert10,

  // Toast states
  showToast1,
  setShowToast1,
  toastMessage,
  setToastMessage,

  // Loading states
  isGeneratingPDF,
  isGeneratingCSV,
  isExportingAllPDF,
  setIsGeneratingPDF,
  setIsGeneratingCSV,
  setIsExportingAllPDF,

  // Progress messages
  pdfProgress,
  exportAllProgress,

  // Data for dialogs
  selectedFile,
  filePassword,

  // Handlers
  doGeneratePDF,
  doGenerateCSV,
  doExportAllSheetsAsPDF,
  generateInvoiceFilename,
  selectInputText,
  invoiceId,
}) => {
  return (
    <React.Fragment>
      {/* Alert 1 - Cannot update default file */}
      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header="Alert Message"
        message={
          "Cannot update " + selectedFile + " file! Use Save As Button to save."
        }
        buttons={["Ok"]}
      />

      {/* Alert 2 - File updated successfully */}
      <IonAlert
        animated
        isOpen={showAlert2}
        onDidDismiss={() => setShowAlert2(false)}
        header="Save"
        message={"File " + selectedFile + " updated successfully"}
        buttons={["Ok"]}
      />

      {/* Alert 4 - File saved successfully */}
      <IonAlert
        animated
        isOpen={showAlert4}
        onDidDismiss={() => setShowAlert4(false)}
        header="Save As"
        message={"File " + selectedFile + " saved successfully"}
        buttons={["Ok"]}
      />

      {/* Alert 6 - Export as PDF */}
      <IonAlert
        animated
        isOpen={showAlert6}
        onDidDismiss={() => setShowAlert6(false)}
        header="Export as PDF"
        inputs={[
          {
            name: "pdfFilename",
            type: "text",
            placeholder: "Enter PDF filename",
            value: invoiceId || selectedFile || "invoice",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Download",
            handler: (alertData) => {
              const filename =
                alertData.pdfFilename?.trim() || invoiceId || selectedFile || "invoice";
              doGeneratePDF(filename);
            },
          },
        ]}
      />

      {/* Alert 7 - Export as CSV */}
      <IonAlert
        animated
        isOpen={showAlert7}
        onDidDismiss={() => setShowAlert7(false)}
        header="Export as CSV"
        inputs={[
          {
            name: "csvFilename",
            type: "text",
            placeholder: "Enter CSV filename",
            value: invoiceId || selectedFile || "invoice_data",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Export",
            handler: (alertData) => {
              const filename =
                alertData.csvFilename?.trim() || invoiceId || selectedFile || "invoice_data";
              doGenerateCSV(filename);
            },
          },
        ]}
      />

      {/* Alert 8 - Export Workbook as PDF */}
      <IonAlert
        animated
        isOpen={showAlert8}
        onDidDismiss={() => setShowAlert8(false)}
        header="Download Workbook as PDF"
        inputs={[
          {
            name: "pdfFilename",
            type: "text",
            placeholder: "Enter PDF filename",
            value: invoiceId ? `${invoiceId}_all_sheets` : (selectedFile ? `${selectedFile}_all_sheets` : "all_invoices"),
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Download",
            handler: (alertData) => {
              const defaultName = invoiceId ? `${invoiceId}_all_sheets` : (selectedFile ? `${selectedFile}_all_sheets` : "all_invoices");
              const filename =
                alertData.pdfFilename?.trim() ||
                defaultName;
              doExportAllSheetsAsPDF(filename);
            },
          },
        ]}
      />

      {/* Alert 10 - Password Input */}
      <IonAlert
        animated
        isOpen={showAlert10}
        onDidDismiss={() => setShowAlert10(false)}
        header="Password Input"
        message="Enter the password to access the file"
        inputs={[
          {
            name: "password",
            type: "password",
            placeholder: "Enter password",
          },
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Access",
            handler: (alertData) => {
              if (alertData.password === filePassword) {
                setToastMessage("File accessed successfully");
                setShowToast1(true);
              } else {
                setToastMessage("Incorrect password");
                setShowToast1(true);
              }
            },
          },
        ]}
      />

      {/* Toast for notifications */}

      {/* Toast */}
      <IonToast
        animated
        isOpen={showToast1}
        onDidDismiss={() => {
          setShowToast1(false);
          // Only show Save As alert if it was a validation error from Save As action
          // Don't show Save As dialog for server save, blockchain save, or other operations
          if (
            (toastMessage.includes("Filename") ||
              toastMessage.includes("Special Characters") ||
              toastMessage.includes("too long") ||
              toastMessage.includes("empty") ||
              toastMessage.includes("exists")) &&
            !toastMessage.includes("server") &&
            !toastMessage.includes("blockchain") &&
            !toastMessage.includes("IPFS") &&
            !toastMessage.includes("Server") &&
            !toastMessage.includes("PDF") &&
            !toastMessage.includes("CSV")
          ) {
            setShowAlert3(true);
          }
        }}
        position="bottom"
        message={toastMessage}
        duration={3000}
      />

      {/* Loading - PDF Generation */}
      <IonLoading
        isOpen={isGeneratingPDF}
        message={pdfProgress || "Generating PDF..."}
        onDidDismiss={() => setIsGeneratingPDF(false)}
      />

      {/* Loading - CSV Generation */}
      <IonLoading
        isOpen={isGeneratingCSV}
        message="Generating CSV..."
        onDidDismiss={() => setIsGeneratingCSV(false)}
      />

      {/* Loading - Export All PDF */}
      <IonLoading
        isOpen={isExportingAllPDF}
        message={exportAllProgress || "Exporting all sheets as PDF..."}
        onDidDismiss={() => setIsExportingAllPDF(false)}
      />
    </React.Fragment>
  );
};

export default MenuDialogs;
