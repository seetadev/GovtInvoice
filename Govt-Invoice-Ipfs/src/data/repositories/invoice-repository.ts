/**
 * Invoice Repository — localStorage implementation
 * Includes 8-file limit for saved invoices
 */

import { SavedInvoice, UserTemplate } from '../types';

const INVOICE_KEY = 'ls_invoices';
const TEMPLATE_KEY = 'ls_user_templates';
export const MAX_INVOICES = 8;

// --- helpers ---
function readList<T>(key: string): T[] {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
}
function writeList<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
}

export const invoiceRepository = {
    // ==================== INVOICE METHODS ====================

    async getAllInvoices(): Promise<SavedInvoice[]> {
        return readList<SavedInvoice>(INVOICE_KEY)
            .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());
    },

    async getInvoiceById(id: string): Promise<SavedInvoice | null> {
        return readList<SavedInvoice>(INVOICE_KEY).find(i => i.id === id) || null;
    },

    async invoiceExists(id: string): Promise<boolean> {
        return readList<SavedInvoice>(INVOICE_KEY).some(i => i.id === id);
    },

    /**
     * Check whether another invoice can be created (limit = 8).
     * Returns true if under the limit OR if the invoice already exists (update).
     */
    async canCreateInvoice(id?: string): Promise<boolean> {
        const items = readList<SavedInvoice>(INVOICE_KEY);
        if (id && items.some(i => i.id === id)) return true; // updating existing
        return items.length < MAX_INVOICES;
    },

    async createInvoice(invoice: Omit<SavedInvoice, 'createdAt' | 'modifiedAt'>): Promise<boolean> {
        try {
            const items = readList<SavedInvoice>(INVOICE_KEY);
            if (items.length >= MAX_INVOICES) {
                console.warn('[InvoiceRepository] Cannot create invoice — limit of ' + MAX_INVOICES + ' reached');
                return false;
            }
            const now = new Date().toISOString();
            items.push({ ...invoice, createdAt: now, modifiedAt: now } as SavedInvoice);
            writeList(INVOICE_KEY, items);
            return true;
        } catch { return false; }
    },

    async updateInvoice(id: string, invoice: Partial<SavedInvoice>): Promise<boolean> {
        try {
            const items = readList<SavedInvoice>(INVOICE_KEY);
            const idx = items.findIndex(i => i.id === id);
            if (idx === -1) return false;
            items[idx] = { ...items[idx], ...invoice, modifiedAt: new Date().toISOString() };
            writeList(INVOICE_KEY, items);
            return true;
        } catch { return false; }
    },

    async saveInvoice(invoice: Omit<SavedInvoice, 'createdAt' | 'modifiedAt'> & { id?: string }): Promise<boolean> {
        const id = invoice.id || Date.now().toString();
        const invoiceWithId = { ...invoice, id };
        const existing = readList<SavedInvoice>(INVOICE_KEY).find(i => i.id === id);
        if (existing) return this.updateInvoice(id, invoiceWithId);
        return this.createInvoice(invoiceWithId);
    },

    async deleteInvoice(id: string): Promise<boolean> {
        try {
            writeList(INVOICE_KEY, readList<SavedInvoice>(INVOICE_KEY).filter(i => i.id !== id));
            return true;
        } catch { return false; }
    },

    async renameInvoice(id: string, newName: string): Promise<boolean> {
        return this.updateInvoice(id, { name: newName } as Partial<SavedInvoice>);
    },

    async countInvoices(): Promise<number> {
        return readList<SavedInvoice>(INVOICE_KEY).length;
    },

    async deleteAllInvoices(): Promise<boolean> {
        try { localStorage.removeItem(INVOICE_KEY); return true; } catch { return false; }
    },

    // ==================== USER TEMPLATE METHODS ====================

    async getAllUserTemplates(): Promise<UserTemplate[]> {
        return readList<UserTemplate>(TEMPLATE_KEY)
            .sort((a, b) => new Date(b.importedAt).getTime() - new Date(a.importedAt).getTime());
    },

    async getUserTemplateById(id: string): Promise<UserTemplate | null> {
        return readList<UserTemplate>(TEMPLATE_KEY).find(t => t.id === id) || null;
    },

    async createUserTemplate(template: UserTemplate): Promise<boolean> {
        try {
            const items = readList<UserTemplate>(TEMPLATE_KEY);
            items.push(template);
            writeList(TEMPLATE_KEY, items);
            return true;
        } catch { return false; }
    },

    async deleteUserTemplate(id: string): Promise<boolean> {
        try {
            writeList(TEMPLATE_KEY, readList<UserTemplate>(TEMPLATE_KEY).filter(t => t.id !== id));
            return true;
        } catch { return false; }
    },

    async updateUserTemplateMeta(id: string, updates: { selectedColor?: string }): Promise<boolean> {
        try {
            const items = readList<UserTemplate>(TEMPLATE_KEY);
            const idx = items.findIndex(t => t.id === id);
            if (idx === -1) return false;
            if (updates.selectedColor !== undefined) items[idx].selectedColor = updates.selectedColor;
            writeList(TEMPLATE_KEY, items);
            return true;
        } catch { return false; }
    },

    async countUserTemplates(): Promise<number> {
        return readList<UserTemplate>(TEMPLATE_KEY).length;
    },

    async deleteAllUserTemplates(): Promise<boolean> {
        try { localStorage.removeItem(TEMPLATE_KEY); return true; } catch { return false; }
    }
};

export default invoiceRepository;
