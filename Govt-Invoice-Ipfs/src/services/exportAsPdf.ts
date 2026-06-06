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

// Helper function to add header and footer to each page
const addHeaderAndFooter = (
  pdf: jsPDF,
  pageNumber: number,
  totalPages: number
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Get current date and time
  const now = new Date();
  const dateTimeString = now.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  // Set font for header/footer
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100); // Gray color

  // Add date/time at top left
  pdf.text(dateTimeString, 10, 8);

  // Add "Invoice" at bottom left
  pdf.text("Invoice", 10, pageHeight - 5);

  // Add page number at bottom right
  const pageText = `Page ${pageNumber} of ${totalPages}`;
  const pageTextWidth = pdf.getTextWidth(pageText);
  pdf.text(pageText, pageWidth - pageTextWidth - 10, pageHeight - 5);

  // Reset text color to black for content
  pdf.setTextColor(0, 0, 0);
};

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
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2 - 10; // Leave space for header/footer

    let heightLeft = imgHeight;
    let position = margin + 5; // Start below header space

    onProgress?.("Adding content to PDF...");

    // Calculate total pages needed
    const totalPages = Math.ceil(imgHeight / pageHeight);
    let pageNumber = 1;

    // Add first page
    pdf.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      margin,
      position,
      imgWidth,
      Math.min(imgHeight, pageHeight), // Don't exceed page height
      undefined,
      "FAST"
    );

    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + margin + 5; // Account for header space
      pdf.addPage();
      pageNumber++;

      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        position,
        imgWidth,
        Math.min(imgHeight, pageHeight), // Don't exceed page height
        undefined,
        "FAST"
      );

      heightLeft -= pageHeight;
    }

    // Add headers and footers to all pages
    onProgress?.("Adding headers and footers...");
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addHeaderAndFooter(pdf, i, totalPages);
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
    throw new Error("Failed to generate PDF. Please try again.");
  }
};
