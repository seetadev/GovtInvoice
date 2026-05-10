export interface ValidationResult {
  valid: boolean;
  message: string;
}

export function validateInvoice(
  filename: string,
  content: string
): ValidationResult {
  const trimmed = filename.trim();

  if (!trimmed || trimmed === "default" || trimmed === "Untitled") {
    return {
      valid: false,
      message: "Please save with a meaningful filename before proceeding.",
    };
  }

  if (!content || content.trim().length === 0) {
    return {
      valid: false,
      message: "Invoice content is empty. Please add data before saving.",
    };
  }

  // Parse SocialCalc savestr to check if any cell has real data
  const hasCellData = /^cell:[A-Z]+\d+:.*[tvf]:/m.test(content);
  if (!hasCellData) {
    return {
      valid: false,
      message: "Invoice appears empty. Please fill in invoice details before saving.",
    };
  }

  return { valid: true, message: "" };
}
