import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ExportOptions {
  filename?: string;
  format?: "a4" | "letter" | "legal";
  orientation?: "portrait" | "landscape";
  margin?: number;
  quality?: number;
  onProgress?: (message: string) => void;
}

export const exportHTMLAsPDF = async (
  htmlContent: string,
  options: ExportOptions & { returnBlob?: boolean } = {}
): Promise<void | Blob> => {
  const {
    filename = "invoice",
    format = "a4",
    orientation = "portrait",
    margin = 10,
    onProgress,
    returnBlob = false,
  } = options;

  try {
    onProgress?.("Preparing HTML content...");

    // Create a temporary container for the HTML content
    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = "absolute";
    tempContainer.style.left = "-9999px";
    tempContainer.style.top = "-9999px";
    tempContainer.style.width = "210mm"; // A4 width
    tempContainer.style.padding = "20px";
    tempContainer.style.backgroundColor = "white";
    tempContainer.style.color = "#000";
    tempContainer.style.fontFamily = "Arial, sans-serif";

    document.body.appendChild(tempContainer);

    onProgress?.("Loading File...");

    // Convert HTML to canvas
    const canvas = await html2canvas(
      tempContainer,
      {
        useCORS: true,
        allowTaint: true,
        background: "#ffffff",
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scale: 4, // Increase scale for higher resolution
      } as any // <-- Add this type assertion
    );
    // Remove temporary container
    document.body.removeChild(tempContainer);

    onProgress?.("Creating PDF document...");

    // Create PDF
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: format,
    });

    // Calculate dimensions
    const imgWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

    let heightLeft = imgHeight;
    let position = margin;

    onProgress?.("Adding content to PDF...");

    // Add first page
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      position,
      imgWidth,
      imgHeight,
      undefined,
      "FAST"
    );

    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      heightLeft -= pageHeight;
    }

    onProgress?.("Saving PDF file...");

    if (returnBlob) {
      // Return the PDF as a blob for sharing
      onProgress?.("PDF generated successfully!");
      return pdf.output("blob");
    } else {
      // Save the PDF (original behavior)
      pdf.save(`${filename}.pdf`);
      onProgress?.("PDF generated successfully!");
    }
  } catch (error) {
    throw new Error("Failed to generate PDF");
  }
};
