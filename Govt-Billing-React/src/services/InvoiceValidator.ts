/**
 * InvoiceValidator.ts
 *
 * Client-side validation for invoice data before save operations.
 *
 * Validation rules are derived from formal invoice processing research
 * conducted during Meta AI Hackathon 2026, where reward functions were
 * designed to penalize incomplete or incorrect invoice submissions.
 *
 * Rules cover:
 * - Field completeness (name, content)
 * - Empty invoice detection
 * - Default/placeholder name detection
 * - Content minimum length check
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates an invoice before it is saved locally or to the cloud.
 * Returns a ValidationResult with errors (blockers) and warnings (advisories).
 *
 * @param fileName - The name the user gave to this invoice
 * @param content - The raw SocialCalc spreadsheet string content
 */
export const validateInvoiceBeforeSave = (
  fileName: string,
  content: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // --- ERRORS (block the save) ---

  // Rule 1: Name must exist and not be empty
  if (!fileName || fileName.trim() === "") {
    errors.push("Invoice must have a name before saving.");
  }

  // Rule 2: Name must not be the default placeholder
  if (fileName && fileName.trim().toLowerCase() === "default") {
    errors.push(
      'Please give this invoice a real name. "default" is not a valid invoice name.'
    );
  }

  // Rule 3: Content must exist
  if (!content || content.trim() === "") {
    errors.push("Invoice content is empty. Please fill in invoice details before saving.");
  }

  // Rule 4: Content must be meaningful (not just template with no data)
  // SocialCalc stores cell data in savestr — if it's under 100 chars
  // after the version header, the invoice has no real data in it
  if (content && content.length < 100) {
    errors.push("Invoice appears to have no data. Please fill in at least some fields.");
  }

  // --- WARNINGS (allow save but inform user) ---

  // Warning 1: Name is very short (likely not descriptive)
  if (fileName && fileName.trim().length > 0 && fileName.trim().length < 4) {
    warnings.push(
      "Invoice name is very short. Consider a more descriptive name like 'School-Supplies-May-2026'."
    );
  }

  // Warning 2: No invoice number found in content
  // SocialCalc stores text as t:VALUE in the savestr
  // Invoice number fields are labeled as "INVOICE #" in the template
  if (content && !content.includes("INVOICE #") && !content.includes("Invoice #")) {
    warnings.push("Invoice number field appears to be missing from this template.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Checks if an invoice name already exists in the saved files list.
 * Used to warn users before overwriting.
 *
 * @param name - Invoice name to check
 * @param existingKeys - Array of already saved invoice names
 */
export const checkForDuplicateName = (
  name: string,
  existingKeys: string[]
): boolean => {
  return existingKeys
    .map((k) => k.toLowerCase().trim())
    .includes(name.toLowerCase().trim());
};