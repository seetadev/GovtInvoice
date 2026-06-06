/**
 * Local Template Service
 * Handles all template and invoice operations locally for offline app
 * Uses localStorage for invoice/template storage, local files for template data
 */

import { invoiceRepository } from '../data/repositories';
import { MAX_INVOICES } from '../data/repositories/invoice-repository';
import type { SavedInvoice as DbSavedInvoice, UserTemplate as DbUserTemplate } from '../data/types';

// Types
export interface ColorVariant {
    id: number;
    image: string;
    dataPath: string;
    hex: string;
}

export interface TemplateMeta {
    id: number | string;
    name: string;
    description: string;
    type: string;
    device: 'mobile' | 'tablet' | 'desktop';
    image: string;
    isPremium: boolean;
    price: { [key: string]: number };
    hashtags?: string[];
    // Color variant support
    hasColorVariants?: boolean;
    colorVariants?: Record<string, ColorVariant>;
    defaultColor?: string;
}

export interface TemplateData {
    msc: any;
    footers: any[];
    appMapping: any;
}

// Invoice item for items array
export interface InvoiceItem {
    rowNumber: number;
    cells: { [columnName: string]: string | number | null };
}

// Form details for From and BillTo
export interface InvoiceFormDetails {
    [fieldName: string]: string | null;
}

export interface UserTemplate extends TemplateMeta {
    data: TemplateData;
    importedAt: string;
    selectedColor?: string; // Track which color was imported
}

export interface SavedInvoice {
    id: string;
    name: string;
    templateId: string | number;
    content: string;
    billType: number;
    createdAt: string;
    modifiedAt: string;
    total?: number | null;
    // New metadata fields
    invoiceNumber?: string | null;
    invoiceDate?: string | null;
    fromDetails?: InvoiceFormDetails | null;
    billToDetails?: InvoiceFormDetails | null;
    items?: InvoiceItem[] | null;
}

// Non-color-variant template IDs (100001-100008 are the ones that actually exist)
const STANDALONE_TEMPLATE_IDS = Array.from({ length: 2 }, (_, i) => 100001 + i);

// Color variant base template IDs (none currently exist - keeping empty array for future use)
const COLOR_VARIANT_BASE_IDS: number[] = [];

// Combined template IDs for display (standalone + consolidated color variants)
const ALL_TEMPLATE_IDS = [...STANDALONE_TEMPLATE_IDS, ...COLOR_VARIANT_BASE_IDS];

/**
 * Fetch template metadata from local public folder
 */
async function fetchTemplateMeta(id: number): Promise<TemplateMeta | null> {
    try {
        const response = await fetch(`/templates/meta/${id}-meta.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching template meta ${id}:`, error);
        return null;
    }
}

/**
 * Fetch consolidated template metadata (for color variant templates)
 */
async function fetchConsolidatedMeta(id: number): Promise<TemplateMeta | null> {
    try {
        const response = await fetch(`/templates/meta-consolidated/${id}-meta.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching consolidated template meta ${id}:`, error);
        return null;
    }
}

/**
 * Fetch template data from local public folder
 */
async function fetchTemplateData(id: number): Promise<TemplateData | null> {
    try {
        const response = await fetch(`/templates/data/${id}.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error(`Error fetching template data ${id}:`, error);
        return null;
    }
}

export const localTemplateService = {
    /**
     * Fetch all available store templates (metadata only for listing)
     * Uses consolidated metadata for color variant templates
     */
    async fetchStoreTemplates(page: number = 1, limit: number = 10): Promise<{ items: TemplateMeta[], pagination: { total: number, page: number, limit: number } }> {
        const start = (page - 1) * limit;
        const end = start + limit;
        const templateIds = ALL_TEMPLATE_IDS.slice(start, end);

        const templates: TemplateMeta[] = [];

        for (const id of templateIds) {
            // Check if this is a color variant base ID
            const isColorVariant = COLOR_VARIANT_BASE_IDS.includes(id);

            let meta: TemplateMeta | null = null;
            if (isColorVariant) {
                // Fetch consolidated metadata for color variant templates
                meta = await fetchConsolidatedMeta(id);
            } else {
                // Fetch regular metadata for standalone templates
                meta = await fetchTemplateMeta(id);
            }

            if (meta) {
                templates.push(meta);
            }
        }

        return {
            items: templates,
            pagination: {
                total: ALL_TEMPLATE_IDS.length,
                page,
                limit
            }
        };
    },

    /**
     * Fetch a specific store template with full data
     */
    async fetchStoreTemplate(id: number | string): Promise<{ meta: TemplateMeta, data: TemplateData } | null> {
        const numId = typeof id === 'string' ? parseInt(id, 10) : id;

        const [meta, data] = await Promise.all([
            fetchTemplateMeta(numId),
            fetchTemplateData(numId)
        ]);

        if (!meta || !data) return null;

        return { meta, data };
    },

    /**
     * Get user's imported templates from localStorage
     */
    async getUserTemplates(): Promise<UserTemplate[]> {
        try {
            const dbTemplates = await invoiceRepository.getAllUserTemplates();
            return dbTemplates.map(t => ({
                ...JSON.parse(t.templateData),
                selectedColor: t.selectedColor,
                importedAt: t.importedAt
            }));
        } catch (error) {
            console.error('Error reading user templates:', error);
            return [];
        }
    },

    /**
     * Save a user template to localStorage
     */
    async saveUserTemplate(template: UserTemplate): Promise<boolean> {
        try {
            const { data, importedAt, selectedColor, ...meta } = template;
            const dbTemplate: DbUserTemplate = {
                id: String(template.id),
                templateData: JSON.stringify({ ...meta, data }),
                selectedColor: selectedColor,
                importedAt: importedAt || new Date().toISOString()
            };
            return await invoiceRepository.createUserTemplate(dbTemplate);
        } catch (error) {
            console.error('Error saving user template:', error);
            return false;
        }
    },

    /**
     * Import a store template to user's collection
     * @param storeTemplateId - The base template ID
     * @param customName - Custom name for the imported template
     * @param selectedColor - Optional color name for color variant templates
     */
    async importTemplate(storeTemplateId: number | string, customName: string, selectedColor?: string): Promise<boolean> {
        try {
            const numId = typeof storeTemplateId === 'string' ? parseInt(storeTemplateId, 10) : storeTemplateId;
            const isColorVariant = COLOR_VARIANT_BASE_IDS.includes(numId);

            let meta: TemplateMeta | null = null;
            let data: TemplateData | null = null;

            if (isColorVariant) {
                // Fetch consolidated meta for color variant templates
                meta = await fetchConsolidatedMeta(numId);

                if (meta && meta.colorVariants && selectedColor && meta.colorVariants[selectedColor]) {
                    // Fetch data from the selected color variant
                    const variant = meta.colorVariants[selectedColor];
                    data = await fetchTemplateData(variant.id);

                    // Update image to match selected color
                    meta = { ...meta, image: variant.image };
                } else if (meta && meta.colorVariants && meta.defaultColor) {
                    // Use default color if no color selected
                    const variant = meta.colorVariants[meta.defaultColor];
                    data = await fetchTemplateData(variant.id);
                }
            } else {
                // Regular template - fetch normally
                meta = await fetchTemplateMeta(numId);
                data = await fetchTemplateData(numId);
            }

            if (!meta || !data) return false;

            const userTemplate: UserTemplate = {
                ...meta,
                id: customName, // Use custom name as ID for user templates
                name: customName,
                data: data,
                importedAt: new Date().toISOString(),
                selectedColor: selectedColor
            };

            return await this.saveUserTemplate(userTemplate);
        } catch (error) {
            console.error('Error importing template:', error);
            return false;
        }
    },

    /**
     * Get a user template by ID
     */
    async getUserTemplate(id: string): Promise<UserTemplate | null> {
        try {
            const dbTemplate = await invoiceRepository.getUserTemplateById(id);
            if (!dbTemplate) return null;
            return {
                ...JSON.parse(dbTemplate.templateData),
                selectedColor: dbTemplate.selectedColor,
                importedAt: dbTemplate.importedAt
            };
        } catch (error) {
            console.error('Error getting user template:', error);
            return null;
        }
    },

    /**
     * Delete a user template
     */
    async deleteUserTemplate(id: string): Promise<boolean> {
        try {
            return await invoiceRepository.deleteUserTemplate(id);
        } catch (error) {
            console.error('Error deleting user template:', error);
            return false;
        }
    },

    /**
     * Update user template metadata
     */
    async updateUserTemplateMeta(id: string, updates: Partial<TemplateMeta>): Promise<boolean> {
        try {
            // For now, just update selectedColor if provided
            if ('selectedColor' in updates) {
                return await invoiceRepository.updateUserTemplateMeta(id, { selectedColor: updates.selectedColor as string });
            }
            return true;
        } catch (error) {
            console.error('Error updating user template:', error);
            return false;
        }
    },

    /**
     * Get all saved invoices from localStorage
     */
    async getSavedInvoices(): Promise<SavedInvoice[]> {
        try {
            const dbInvoices = await invoiceRepository.getAllInvoices();
            return dbInvoices.map(inv => ({
                id: inv.id,
                name: inv.name,
                templateId: inv.templateId,
                content: inv.content,
                billType: inv.billType,
                createdAt: inv.createdAt,
                modifiedAt: inv.modifiedAt,
                total: inv.total,
                invoiceNumber: inv.invoiceNumber,
                invoiceDate: inv.invoiceDate,
                fromDetails: inv.fromDetails,
                billToDetails: inv.billToDetails,
                items: inv.items
            }));
        } catch (error) {
            console.error('Error reading saved invoices:', error);
            return [];
        }
    },

    /**
     * Get a specific invoice by filename/ID
     */
    async getInvoice(id: string): Promise<SavedInvoice | null> {
        try {
            const dbInvoice = await invoiceRepository.getInvoiceById(id);
            if (!dbInvoice) {
                // Try to find by name
                const allInvoices = await this.getSavedInvoices();
                return allInvoices.find(inv => inv.name === id) || null;
            }
            return {
                id: dbInvoice.id,
                name: dbInvoice.name,
                templateId: dbInvoice.templateId,
                content: dbInvoice.content,
                billType: dbInvoice.billType,
                createdAt: dbInvoice.createdAt,
                modifiedAt: dbInvoice.modifiedAt,
                total: dbInvoice.total,
                invoiceNumber: dbInvoice.invoiceNumber,
                invoiceDate: dbInvoice.invoiceDate,
                fromDetails: dbInvoice.fromDetails,
                billToDetails: dbInvoice.billToDetails,
                items: dbInvoice.items
            };
        } catch (error) {
            console.error('Error getting invoice:', error);
            return null;
        }
    },

    /**
     * Save an invoice to localStorage
     */
    async saveInvoice(invoice: Omit<SavedInvoice, 'createdAt' | 'modifiedAt'> & { id?: string }): Promise<boolean> {
        try {
            return await invoiceRepository.saveInvoice({
                id: invoice.id || `invoice_${Date.now()}`,
                name: invoice.name,
                templateId: String(invoice.templateId),
                content: invoice.content,
                billType: invoice.billType || 0,
                total: invoice.total,
                invoiceNumber: invoice.invoiceNumber,
                invoiceDate: invoice.invoiceDate,
                fromDetails: invoice.fromDetails,
                billToDetails: invoice.billToDetails,
                items: invoice.items
            });
        } catch (error) {
            console.error('Error saving invoice:', error);
            return false;
        }
    },

    /**
     * Delete an invoice
     */
    async deleteInvoice(id: string): Promise<boolean> {
        try {
            return await invoiceRepository.deleteInvoice(id);
        } catch (error) {
            console.error('Error deleting invoice:', error);
            return false;
        }
    },

    /**
     * Check if an invoice exists
     */
    async invoiceExists(id: string): Promise<boolean> {
        try {
            return await invoiceRepository.invoiceExists(id);
        } catch (error) {
            console.error('Error checking invoice:', error);
            return false;
        }
    },

    /**
     * Check if user can create a new invoice (8-file limit)
     */
    async canCreateInvoice(): Promise<boolean> {
        return invoiceRepository.canCreateInvoice();
    },

    /**
     * Get current invoice count
     */
    async getInvoiceCount(): Promise<number> {
        return invoiceRepository.countInvoices();
    },

    /**
     * Maximum invoices allowed
     */
    maxInvoices: MAX_INVOICES,

    /**
     * Set the active template ID
     */
    async setActiveTemplateId(id: number | string): Promise<void> {
        localStorage.setItem('stark-invoice-active-template-id', String(id));
    },

    /**
     * Get the active template ID
     */
    async getActiveTemplateId(): Promise<number | string | null> {
        const id = localStorage.getItem('stark-invoice-active-template-id');
        if (!id) return null;
        return isNaN(Number(id)) ? id : Number(id);
    },

    /**
     * Clear active template ID
     */
    async clearActiveTemplateId(): Promise<void> {
        localStorage.removeItem('stark-invoice-active-template-id');
    }
};

export default localTemplateService;
