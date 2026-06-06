import { getInvoiceFormat, getSequentialNumber, getInvoicePrefix, setSequentialNumber } from './settings';

export class InvoiceGenerator {
    /**
     * Generates a new Invoice ID based on current settings
     */
    static generateId(): string {
        const format = getInvoiceFormat();
        const prefix = getInvoicePrefix();

        switch (format) {
            case 'unique-id':
                const randomId = crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).substring(2, 10);
                return `${prefix}${randomId.toUpperCase()}`;

            case 'sequential':
                const seqNum = getSequentialNumber();
                // Format with leading zeros to at least 5 digits
                return `${prefix}${String(seqNum).padStart(5, '0')}`;

            case 'invoice-date-timestamp':
            default:
                return `${prefix}${Date.now().toString()}`;
        }
    }

    /**
     * Increments the sequential number if the current format is 'sequential'.
     * Should be called after a successful save of a new invoice.
     */
    static incrementSequentialNumber(): void {
        const format = getInvoiceFormat();
        if (format === 'sequential') {
            const current = getSequentialNumber();
            setSequentialNumber(current + 1);
        }
    }
}
