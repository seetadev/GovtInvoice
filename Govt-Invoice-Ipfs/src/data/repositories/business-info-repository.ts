/**
 * Business Info Repository — localStorage implementation
 * Handles addresses, signatures, and logos
 */

import { BusinessAddress, Signature, Logo } from '../types';

const ADDR_KEY = 'ls_business_addresses';
const SIG_KEY = 'ls_signatures';
const LOGO_KEY = 'ls_logos';
const SELECTED_SIG_KEY = 'ls_selected_signature_id';
const SELECTED_LOGO_KEY = 'ls_selected_logo_id';

// --- helpers ---
function readList<T>(key: string): T[] {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
}
function writeList<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
}

export const businessInfoRepository = {
    // ==================== ADDRESS METHODS ====================
    async getAllAddresses(): Promise<BusinessAddress[]> {
        return readList<BusinessAddress>(ADDR_KEY);
    },
    async getAddressById(id: string): Promise<BusinessAddress | null> {
        return readList<BusinessAddress>(ADDR_KEY).find(a => a.id === id) || null;
    },
    async createAddress(address: Omit<BusinessAddress, 'createdAt'>): Promise<boolean> {
        try {
            const items = readList<BusinessAddress>(ADDR_KEY);
            items.push({ ...address, createdAt: new Date().toISOString() } as BusinessAddress);
            writeList(ADDR_KEY, items);
            return true;
        } catch { return false; }
    },
    async updateAddress(id: string, address: Partial<BusinessAddress>): Promise<boolean> {
        try {
            const items = readList<BusinessAddress>(ADDR_KEY);
            const idx = items.findIndex(a => a.id === id);
            if (idx === -1) return false;
            items[idx] = { ...items[idx], ...address };
            writeList(ADDR_KEY, items);
            return true;
        } catch { return false; }
    },
    async saveAddress(address: Omit<BusinessAddress, 'createdAt'>): Promise<boolean> {
        const existing = readList<BusinessAddress>(ADDR_KEY).find(a => a.id === address.id);
        if (existing) return this.updateAddress(address.id, address);
        return this.createAddress(address);
    },
    async deleteAddress(id: string): Promise<boolean> {
        try { writeList(ADDR_KEY, readList<BusinessAddress>(ADDR_KEY).filter(a => a.id !== id)); return true; }
        catch { return false; }
    },
    async getAddressCount(): Promise<number> {
        return readList<BusinessAddress>(ADDR_KEY).length;
    },

    // ==================== SIGNATURE METHODS ====================
    async getAllSignatures(): Promise<Signature[]> {
        return readList<Signature>(SIG_KEY);
    },
    async getSelectedSignature(): Promise<Signature | null> {
        const id = localStorage.getItem(SELECTED_SIG_KEY);
        if (!id) return null;
        return readList<Signature>(SIG_KEY).find(s => s.id === id) || null;
    },
    async getSelectedSignatureId(): Promise<string | null> {
        return localStorage.getItem(SELECTED_SIG_KEY);
    },
    async createSignature(signature: Omit<Signature, 'createdAt'>): Promise<boolean> {
        try {
            const items = readList<Signature>(SIG_KEY);
            items.push({ ...signature, createdAt: new Date().toISOString() } as Signature);
            writeList(SIG_KEY, items);
            if (signature.isSelected) localStorage.setItem(SELECTED_SIG_KEY, signature.id);
            return true;
        } catch { return false; }
    },
    async selectSignature(id: string | null): Promise<boolean> {
        try {
            if (id) localStorage.setItem(SELECTED_SIG_KEY, id);
            else localStorage.removeItem(SELECTED_SIG_KEY);
            // Update isSelected flags
            const items = readList<Signature>(SIG_KEY).map(s => ({ ...s, isSelected: s.id === id }));
            writeList(SIG_KEY, items);
            return true;
        } catch { return false; }
    },
    async deleteSignature(id: string): Promise<boolean> {
        try {
            writeList(SIG_KEY, readList<Signature>(SIG_KEY).filter(s => s.id !== id));
            const selId = localStorage.getItem(SELECTED_SIG_KEY);
            if (selId === id) localStorage.removeItem(SELECTED_SIG_KEY);
            return true;
        } catch { return false; }
    },
    async getSignatureCount(): Promise<number> {
        return readList<Signature>(SIG_KEY).length;
    },

    // ==================== LOGO METHODS ====================
    async getAllLogos(): Promise<Logo[]> {
        return readList<Logo>(LOGO_KEY);
    },
    async getSelectedLogo(): Promise<Logo | null> {
        const id = localStorage.getItem(SELECTED_LOGO_KEY);
        if (!id) return null;
        return readList<Logo>(LOGO_KEY).find(l => l.id === id) || null;
    },
    async getSelectedLogoId(): Promise<string | null> {
        return localStorage.getItem(SELECTED_LOGO_KEY);
    },
    async createLogo(logo: Omit<Logo, 'createdAt'>): Promise<boolean> {
        try {
            const items = readList<Logo>(LOGO_KEY);
            items.push({ ...logo, createdAt: new Date().toISOString() } as Logo);
            writeList(LOGO_KEY, items);
            if (logo.isSelected) localStorage.setItem(SELECTED_LOGO_KEY, logo.id);
            return true;
        } catch { return false; }
    },
    async selectLogo(id: string | null): Promise<boolean> {
        try {
            if (id) localStorage.setItem(SELECTED_LOGO_KEY, id);
            else localStorage.removeItem(SELECTED_LOGO_KEY);
            const items = readList<Logo>(LOGO_KEY).map(l => ({ ...l, isSelected: l.id === id }));
            writeList(LOGO_KEY, items);
            return true;
        } catch { return false; }
    },
    async deleteLogo(id: string): Promise<boolean> {
        try {
            writeList(LOGO_KEY, readList<Logo>(LOGO_KEY).filter(l => l.id !== id));
            const selId = localStorage.getItem(SELECTED_LOGO_KEY);
            if (selId === id) localStorage.removeItem(SELECTED_LOGO_KEY);
            return true;
        } catch { return false; }
    },
    async getLogoCount(): Promise<number> {
        return readList<Logo>(LOGO_KEY).length;
    },

    // ==================== BULK DELETE ====================
    async deleteAllAddresses(): Promise<boolean> {
        try { localStorage.removeItem(ADDR_KEY); return true; } catch { return false; }
    },
    async deleteAllSignatures(): Promise<boolean> {
        try { localStorage.removeItem(SIG_KEY); localStorage.removeItem(SELECTED_SIG_KEY); return true; } catch { return false; }
    },
    async deleteAllLogos(): Promise<boolean> {
        try { localStorage.removeItem(LOGO_KEY); localStorage.removeItem(SELECTED_LOGO_KEY); return true; } catch { return false; }
    }
};

export default businessInfoRepository;
