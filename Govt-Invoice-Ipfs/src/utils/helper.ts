// Function to generate invoice filename with current datetime
export const generateInvoiceFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `invoice-${year}${month}${day}-${hours}${minutes}${seconds}`;
};

// Function to select text in input field after dialog opens

export const selectInputText = (inputElement: HTMLIonInputElement) => {
  if (inputElement && inputElement.getInputElement) {
    inputElement.getInputElement().then((nativeInput) => {
      if (nativeInput) {
        nativeInput.select();
      }
    });
  }
};

// Helper function to check if the default file has user content or is just empty/template
export const isDefaultFileEmpty = (content: string): boolean => {
  try {
    // If content is empty or just whitespace
    if (!content || content.trim() === "") {
      return true;
    }

    let parsedContent;
    try {
      // Try to parse directly first (for raw content)
      parsedContent = JSON.parse(content);
    } catch {
      try {
        // If that fails, try decoding first (for encoded content)
        const decodedContent = decodeURIComponent(content);
        parsedContent = JSON.parse(decodedContent);
      } catch {
        // Error logged
        return true; // Assume empty if we can't parse
      }
    }

    // Check if it contains actual data or is just the template structure
    if (parsedContent && typeof parsedContent === "object") {
      // If it has cells with actual data, consider it non-empty
      if (parsedContent.cells && Object.keys(parsedContent.cells).length > 0) {
        // Check if cells contain actual user data (not just template)
        const cellKeys = Object.keys(parsedContent.cells);
        const hasUserData = cellKeys.some((key) => {
          const cell = parsedContent.cells[key];
          if (!cell || !cell.v) return false;

          const value = cell.v.toString().trim();
          if (value === "") return false;

          // Exclude common template values
          const templateValues = [
            "Invoice",
            "Bill",
            "Receipt",
            "Date",
            "Total",
            "Amount",
            "Description",
            "Quantity",
            "Price",
            "Name",
            "Address",
            "Phone",
            "Email",
            "Tax",
            "Subtotal",
            "Customer",
            "Vendor",
          ];

          return !templateValues.includes(value);
        });
        return !hasUserData;
      }
    }

    return true;
  } catch (error) {
    // Error logged
    return true; // Assume empty on error
  }
};

// Helper function to generate unique "Untitled" filename with timestamp
export const generateUntitledFilename = async (store: any): Promise<string> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${year}${month}${day}-${hours}${minutes}${seconds}`;
  let filename = `Untitled-${timestamp}`;

  // Check if this exact filename exists (unlikely but just in case)
  let counter = 1;
  while (await store._checkKey(filename)) {
    filename = `Untitled-${timestamp}-${counter}`;
    counter++;
  }

  return filename;
};

export const formatDateForFilename = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;
};

// Helper function to check if an error is due to storage quota exceeded
export const isQuotaExceededError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.name === "QuotaExceededError" ||
      error.message.includes("exceeded the quota") ||
      error.message.includes("QuotaExceededError")
    );
  }
  return false;
};

// Helper function to get user-friendly error message for storage quota exceeded
export const getQuotaExceededMessage = (
  operation: string = "operation"
): string => {
  return `Storage quota exceeded! Please delete some local files to free up space before ${operation}.`;
};

// Helper function to estimate localStorage usage
export const getStorageUsageInfo = (): {
  used: number;
  total: number;
  percentage: number;
} => {
  try {
    // Estimate total localStorage quota (typically 5-10MB)
    const totalQuota = 5 * 1024 * 1024; // 5MB as a conservative estimate

    // Calculate used space
    let usedSpace = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedSpace += (localStorage[key].length + key.length) * 2; // UTF-16 uses 2 bytes per character
      }
    }

    return {
      used: usedSpace,
      total: totalQuota,
      percentage: (usedSpace / totalQuota) * 100,
    };
  } catch (error) {
    // Error logged
    return { used: 0, total: 0, percentage: 0 };
  }
};

// Helper function to format bytes for display
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Helper function to provide storage management suggestions
export const getStorageManagementSuggestions = (
  usagePercentage: number
): string[] => {
  const suggestions = [];

  if (usagePercentage > 80) {
    suggestions.push("Delete old or unnecessary files from local storage");
    suggestions.push("Move important files to server storage");
    suggestions.push("Export files as PDF or CSV and delete local copies");
  } else if (usagePercentage > 60) {
    suggestions.push("Consider moving some files to server storage");
    suggestions.push("Review and delete any duplicate files");
  } else {
    suggestions.push("Your storage usage is healthy");
  }

  return suggestions;
};

// User onboarding utilities
// const USER_ONBOARDING_KEY = "invoiceApp_isNewUser";

export const isNewUser = (): boolean => {
  return true;
};

export const markUserAsExisting = (): void => {
  // No-op: Onboarding status is no longer stored
};

export const resetUserOnboarding = (): void => {
  // No-op: Onboarding status is no longer stored
};
