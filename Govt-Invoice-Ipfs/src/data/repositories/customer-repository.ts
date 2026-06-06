/**
 * Customer Repository — localStorage implementation
 */

import { Customer } from '../types';

const STORAGE_KEY = 'ls_customers';

function getAll_sync(): Customer[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveAll(items: Customer[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const customerRepository = {
    async getAll(): Promise<Customer[]> {
        return getAll_sync().sort((a, b) => a.name.localeCompare(b.name));
    },

    async getById(id: string): Promise<Customer | null> {
        return getAll_sync().find(c => c.id === id) || null;
    },

    async create(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<boolean> {
        try {
            const now = new Date().toISOString();
            const items = getAll_sync();
            items.push({ ...customer, createdAt: now, updatedAt: now } as Customer);
            saveAll(items);
            return true;
        } catch { return false; }
    },

    async update(id: string, customer: Partial<Customer>): Promise<boolean> {
        try {
            const items = getAll_sync();
            const idx = items.findIndex(c => c.id === id);
            if (idx === -1) return false;
            items[idx] = { ...items[idx], ...customer, updatedAt: new Date().toISOString() };
            saveAll(items);
            return true;
        } catch { return false; }
    },

    async save(customer: Omit<Customer, 'createdAt' | 'updatedAt'>): Promise<boolean> {
        const existing = getAll_sync().find(c => c.id === customer.id);
        if (existing) return this.update(customer.id, customer);
        return this.create(customer);
    },

    async delete(id: string): Promise<boolean> {
        try {
            const items = getAll_sync().filter(c => c.id !== id);
            saveAll(items);
            return true;
        } catch { return false; }
    },

    async search(query: string): Promise<Customer[]> {
        const q = query.toLowerCase();
        return getAll_sync().filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.phone.toLowerCase().includes(q)
        );
    },

    async count(): Promise<number> {
        return getAll_sync().length;
    },

    async deleteAll(): Promise<boolean> {
        try { localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
    }
};

export default customerRepository;
