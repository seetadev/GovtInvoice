/**
 * Database Types
 * TypeScript interfaces for database entities
 */

// Customer entity
export interface Customer {
    id: string;
    name: string;
    streetAddress: string;
    cityStateZip: string;
    phone: string;
    email: string;
    createdAt?: string;
    updatedAt?: string;
}

// Inventory item entity
export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    isInfiniteStock: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Business address entity
export interface BusinessAddress {
    id: string;
    label: string;
    streetAddress: string;
    cityStateZip: string;
    phone: string;
    email: string;
    createdAt?: string;
}

// Signature entity
export interface Signature {
    id: string;
    name: string;
    data: string; // base64 encoded
    isSelected: boolean;
    createdAt?: string;
}

// Logo entity
export interface Logo {
    id: string;
    name: string;
    data: string; // base64 encoded
    isSelected: boolean;
    createdAt?: string;
}

// Invoice form details
export interface InvoiceFormDetails {
    [key: string]: string | null;
}

// Invoice item
export interface InvoiceItem {
    rowNumber: number;
    cells: { [columnName: string]: string | number | null };
}

// Saved invoice entity
export interface SavedInvoice {
    id: string;
    name: string;
    templateId: string;
    content: string;
    billType: number;
    total?: number | null;
    invoiceNumber?: string | null;
    invoiceDate?: string | null;
    fromDetails?: InvoiceFormDetails | null;
    billToDetails?: InvoiceFormDetails | null;
    items?: InvoiceItem[] | null;
    createdAt: string;
    modifiedAt: string;
}

// User template entity
export interface UserTemplate {
    id: string;
    templateData: string; // JSON stringified TemplateData
    selectedColor?: string;
    importedAt: string;
}

// Legacy row types (kept for compatibility)
export interface CustomerRow {
    id: string;
    name: string;
    street_address: string | null;
    city_state_zip: string | null;
    phone: string | null;
    email: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface InventoryItemRow {
    id: string;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    is_infinite_stock: number;
    created_at: string | null;
    updated_at: string | null;
}

export interface BusinessAddressRow {
    id: string;
    label: string;
    street_address: string | null;
    city_state_zip: string | null;
    phone: string | null;
    email: string | null;
    created_at: string | null;
}

export interface SignatureRow {
    id: string;
    name: string;
    data: string;
    is_selected: number;
    created_at: string | null;
}

export interface LogoRow {
    id: string;
    name: string;
    data: string;
    is_selected: number;
    created_at: string | null;
}

export interface InvoiceRow {
    id: string;
    name: string;
    template_id: string;
    content: string;
    bill_type: number;
    total: number | null;
    invoice_number: string | null;
    invoice_date: string | null;
    from_details: string | null;
    bill_to_details: string | null;
    items: string | null;
    created_at: string;
    modified_at: string;
}

export interface UserTemplateRow {
    id: string;
    template_data: string;
    selected_color: string | null;
    imported_at: string;
}
