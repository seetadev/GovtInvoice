/**
 * Inventory Repository — localStorage implementation
 */

import { InventoryItem } from '../types';

const STORAGE_KEY = 'ls_inventory_items';

function getAll_sync(): InventoryItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveAll(items: InventoryItem[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const inventoryRepository = {
    async getAll(): Promise<InventoryItem[]> {
        return getAll_sync().sort((a, b) => a.name.localeCompare(b.name));
    },

    async getById(id: string): Promise<InventoryItem | null> {
        return getAll_sync().find(i => i.id === id) || null;
    },

    async create(item: Omit<InventoryItem, 'createdAt' | 'updatedAt'>): Promise<boolean> {
        try {
            const now = new Date().toISOString();
            const items = getAll_sync();
            items.push({ ...item, createdAt: now, updatedAt: now } as InventoryItem);
            saveAll(items);
            return true;
        } catch { return false; }
    },

    async update(id: string, item: Partial<InventoryItem>): Promise<boolean> {
        try {
            const items = getAll_sync();
            const idx = items.findIndex(i => i.id === id);
            if (idx === -1) return false;
            items[idx] = { ...items[idx], ...item, updatedAt: new Date().toISOString() };
            saveAll(items);
            return true;
        } catch { return false; }
    },

    async save(item: Omit<InventoryItem, 'createdAt' | 'updatedAt'>): Promise<boolean> {
        const existing = getAll_sync().find(i => i.id === item.id);
        if (existing) return this.update(item.id, item);
        return this.create(item);
    },

    async delete(id: string): Promise<boolean> {
        try {
            const items = getAll_sync().filter(i => i.id !== id);
            saveAll(items);
            return true;
        } catch { return false; }
    },

    async search(query: string): Promise<InventoryItem[]> {
        const q = query.toLowerCase();
        return getAll_sync().filter(i =>
            i.name.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q)
        );
    },

    async count(): Promise<number> {
        return getAll_sync().length;
    },

    async getTotalStockValue(): Promise<number> {
        return getAll_sync()
            .filter(i => !i.isInfiniteStock)
            .reduce((sum, i) => sum + (i.price * i.stock), 0);
    },

    async deleteAll(): Promise<boolean> {
        try { localStorage.removeItem(STORAGE_KEY); return true; } catch { return false; }
    }
};

export default inventoryRepository;
