/**
 * Schema constants — kept for type references only.
 * SQLite is no longer used; data lives in localStorage.
 */

export const SCHEMA_VERSION = 1;

// No SQL needed
export const CREATE_TABLES_SQL = '';

export const MIGRATIONS: { version: number; sql: string }[] = [];

export const TABLE_NAMES = {
    CUSTOMERS: 'customers',
    INVENTORY_ITEMS: 'inventory_items',
    BUSINESS_ADDRESSES: 'business_addresses',
    SIGNATURES: 'signatures',
    LOGOS: 'logos',
    INVOICES: 'invoices',
    USER_TEMPLATES: 'user_templates',
    SCHEMA_VERSION: 'schema_version',
} as const;
