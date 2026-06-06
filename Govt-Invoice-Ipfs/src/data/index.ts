/**
 * Data Module Index
 * Main entry point for the data layer — localStorage only
 */

// Export database service (lightweight stub)
export { database } from './database';

// Export schema constants
export { SCHEMA_VERSION, TABLE_NAMES } from './schema';

// Export types
export * from './types';

// Export repositories
export {
    customerRepository,
    inventoryRepository,
    businessInfoRepository,
    invoiceRepository
} from './repositories';

// Export migration utilities (no-ops)
export { runMigration, isMigrationCompleted, clearMigratedLocalStorage } from './migration';

/**
 * Initialize the data layer
 * With localStorage, there is nothing async to set up.
 */
export async function initializeDataLayer(): Promise<void> {
    if (import.meta.env.DEV) console.log('[Data] LocalStorage data layer ready');
}
