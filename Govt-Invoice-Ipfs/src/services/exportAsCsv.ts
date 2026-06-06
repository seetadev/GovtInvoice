/**
 * Export CSV functionality for invoice data
 */

export interface CSVExportOptions {
  filename?: string;
  delimiter?: string;
  includeHeaders?: boolean;
  returnBlob?: boolean;
}

/**
 * Export CSV content to file or return as blob
 */
export function exportCSV(
  csvContent: string,
  options: CSVExportOptions = {}
): Promise<Blob | void> {
  return new Promise((resolve, reject) => {
    try {
      const {
        filename = "invoice_data",
        delimiter = ",",
        includeHeaders = true,
        returnBlob = false,
      } = options;

      // Clean and format CSV content
      let formattedContent = csvContent;

      // Ensure proper line endings
      formattedContent = formattedContent
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

      // Add BOM for Excel compatibility
      const BOM = "\uFEFF";
      const csvWithBOM = BOM + formattedContent;

      // Create blob
      const blob = new Blob([csvWithBOM], {
        type: "text/csv;charset=utf-8;",
      });

      if (returnBlob) {
        resolve(blob);
        return;
      }

      // Create download link
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Convert spreadsheet data to CSV format
 */
export function convertToCSV(data: any[][]): string {
  if (!data || data.length === 0) {
    return "";
  }

  return data
    .map((row) => {
      return row
        .map((cell) => {
          // Handle null/undefined values
          if (cell === null || cell === undefined) {
            return "";
          }

          // Convert to string
          const value = String(cell);

          // Escape quotes and wrap in quotes if necessary
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }

          return value;
        })
        .join(",");
    })
    .join("\n");
}

/**
 * Parse CSV content from SocialCalc format
 */
export function parseSocialCalcCSV(csvContent: string): string {
  if (!csvContent) {
    return "";
  }

  try {
    // SocialCalc CSV might need some formatting
    // Split into lines and clean up
    const lines = csvContent.split("\n");
    const cleanedLines = lines
      .filter((line) => line.trim() !== "") // Remove empty lines
      .map((line) => line.trim()); // Trim whitespace

    return cleanedLines.join("\n");
  } catch (error) {
    throw new Error("Failed to export as CSV");
  }
}
