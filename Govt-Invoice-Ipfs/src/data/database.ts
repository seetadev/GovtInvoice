/**
 * Database Service — LocalStorage-only implementation
 * All data is stored in window.localStorage.
 * This file no longer uses SQLite.
 */

class DatabaseService {
    private initialized = false;

    async initialize(): Promise<void> {
        if (this.initialized) return;
        this.initialized = true;
        if (import.meta.env.DEV) console.log('[Database] LocalStorage-only mode initialized');
    }

    isReady(): boolean {
        return this.initialized;
    }

    async close(): Promise<void> {
        this.initialized = false;
    }
}

// Export singleton instance
export const database = new DatabaseService();
export default database;
