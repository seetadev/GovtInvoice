import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ExportAllSheetsOptions {
  filename?: string;
  format?: "a4" | "letter" | "legal";
  orientation?: "portrait" | "landscape";
  margin?: number;
  quality?: number;
  onProgress?: (message: string) => void;
  returnBlob?: boolean;
}

export interface SheetData {
  id: string;
  name: string;
  htmlContent: string;
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

export const exportAllSheetsAsPDF = async (
  sheetsData: SheetData[],
  options: ExportAllSheetsOptions = {}
): Promise<void | Blob> => {
  const {
    filename = "all_invoices",
    format = "a4",
    orientation = "portrait",
    margin = 10,
    quality = 2,
    onProgress,
    returnBlob = false,
  } = options;

  try {
    if (!sheetsData || sheetsData.length === 0) {
      throw new Error("No sheets data provided");
    }

    onProgress?.(`Starting export of ${sheetsData.length} sheets...`);

    // Create PDF document
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "mm",
      format: format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth() - margin * 2;
    const pageHeight = pdf.internal.pageSize.getHeight() - margin * 2;

    // Remove the first empty page
    pdf.deletePage(1);

    // Track total pages for numbering
    let currentPageNumber = 0;
    const pagesInfo: Array<{ sheetIndex: number; pageInSheet: number }> = [];

    for (let i = 0; i < sheetsData.length; i++) {
      const sheet = sheetsData[i];

      onProgress?.(
        `Processing sheet ${i + 1}/${sheetsData.length}: ${sheet.name}...`
      );

      // Create temporary container for each sheet
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = sheet.htmlContent;
      tempContainer.style.position = "absolute";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "-9999px";
      tempContainer.style.width = "210mm"; // A4 width
      tempContainer.style.padding = "20px";
      tempContainer.style.backgroundColor = "white";
      tempContainer.style.color = "#000";
      tempContainer.style.fontFamily = "Arial, sans-serif";
      tempContainer.style.fontSize = "12px";
      tempContainer.style.lineHeight = "1.4";

      // Add sheet title
      // const titleElement = document.createElement("h2");
      // titleElement.textContent = `Invoice - ${sheet.name}`;
      // titleElement.style.marginBottom = "20px";
      // titleElement.style.color = "#333";
      // titleElement.style.borderBottom = "2px solid #333";
      // titleElement.style.paddingBottom = "10px";
      // tempContainer.insertBefore(titleElement, tempContainer.firstChild);

      document.body.appendChild(tempContainer);

      try {
        onProgress?.(`Generating Pdf: File ${i + 1}...`);

        // Convert HTML to canvas with higher quality
        const canvas = await html2canvas(tempContainer, {
          useCORS: true,
          allowTaint: true,
          background: "#ffffff",
          width: tempContainer.scrollWidth,
          height: tempContainer.scrollHeight,
          scale: quality,
          logging: false,
          removeContainer: false,
        } as any);

        // Calculate dimensions for PDF
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add new page for each sheet
        pdf.addPage();
        currentPageNumber++;
        pagesInfo.push({ sheetIndex: i, pageInSheet: 1 });

        onProgress?.(`Adding sheet ${i + 1} to PDF...`);

        // If content fits on one page
        if (imgHeight <= pageHeight) {
          pdf.addImage(
            canvas.toDataURL("image/png", 0.95),
            "PNG",
            margin,
            margin + 5, // Leave space for header
            imgWidth,
            Math.min(imgHeight, pageHeight - 10), // Leave space for header and footer
            undefined,
            "FAST"
          );
        } else {
          // Content spans multiple pages
          let heightLeft = imgHeight;
          let position = margin + 5; // Start below header
          let pageInSheet = 1;

          // Add first part
          pdf.addImage(
            canvas.toDataURL("image/png", 0.95),
            "PNG",
            margin,
            position,
            imgWidth,
            Math.min(imgHeight, pageHeight - 10), // Leave space for header and footer
            undefined,
            "FAST"
          );

          heightLeft -= pageHeight - 10; // Account for header/footer space

          // Add continuation pages for this sheet if needed
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight + margin + 5; // Account for header
            pdf.addPage();
            currentPageNumber++;
            pageInSheet++;
            pagesInfo.push({ sheetIndex: i, pageInSheet: pageInSheet });

            pdf.addImage(
              canvas.toDataURL("image/png", 0.95),
              "PNG",
              margin,
              position,
              imgWidth,
              Math.min(imgHeight, pageHeight - 10), // Leave space for header and footer
              undefined,
              "FAST"
            );
            heightLeft -= pageHeight - 10; // Account for header/footer space
          }
        }
      } finally {
        // Always remove the temporary container
        document.body.removeChild(tempContainer);
      }
    }

    // Add headers and footers to all pages
    onProgress?.("Adding headers and footers...");
    const totalPages = currentPageNumber;

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      pdf.setPage(pageNum);
      addHeaderAndFooter(pdf, pageNum, totalPages);
    }

    onProgress?.("Finalizing PDF...");

    if (returnBlob) {
      onProgress?.("PDF generated successfully!");
      return pdf.output("blob");
    } else {
      pdf.save(`${filename}.pdf`);
      onProgress?.("PDF saved successfully!");
    }
  } catch (error) {
    throw new Error("Failed to generate combined PDF. Please try again.");
  }
};

export const exportSingleSheetAsPDF = async (
  htmlContent: string,
  options: ExportAllSheetsOptions = {}
): Promise<void | Blob> => {
  const sheetData: SheetData[] = [
    {
      id: "sheet1",
      name: "Invoice",
      htmlContent: htmlContent,
    },
  ];

  return exportAllSheetsAsPDF(sheetData, options);
};
