/**
 * Data Migration — No-op since we use localStorage directly now.
 */

export function isMigrationCompleted(): boolean {
    return true;
}

export async function runMigration(): Promise<{
    success: boolean;
    stats: Record<string, number>;
}> {
    return { success: true, stats: {} };
}

export function clearMigratedLocalStorage(): void {
    // No-op
}
