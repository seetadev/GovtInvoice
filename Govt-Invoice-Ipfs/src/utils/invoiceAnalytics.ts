import { TemplateData, AppMappingItem } from '../types/template';

export interface CustomerStats {
    name: string;
    email: string;
    phone: string;
    totalSpent: number;
    invoiceCount: number;
    lastPurchase: string;
}

export interface InvoiceAnalytics {
    totalRevenue: number;
    totalInvoices: number;
    averageInvoiceValue: number;
    revenueByMonth: { [key: string]: number };
    gstByMonth: { [key: string]: number };
    topItems: { name: string; count: number; revenue: number }[];
    recentActivity: { date: string; amount: number; fileName: string }[];
    customers: CustomerStats[];
}

export const parseInvoiceData = (files: any[]): InvoiceAnalytics => {
    const analytics: InvoiceAnalytics = {
        totalRevenue: 0,
        totalInvoices: 0,
        averageInvoiceValue: 0,
        revenueByMonth: {},
        gstByMonth: {},
        topItems: [],
        recentActivity: [],
        customers: []
    };

    const itemMap = new Map<string, { count: number; revenue: number }>();
    const customerMap = new Map<string, CustomerStats>();

    files.forEach(file => {
        try {
            // Use stored total from metadata if available (preferred method)
            let totalAmount = 0;
            if (file.total !== undefined && file.total !== null) {
                totalAmount = typeof file.total === 'number' ? file.total : parseFloat(file.total) || 0;
            }

            // Extract customer info from stored billToDetails metadata if available
            let customerName = '';
            let customerEmail = '';
            let customerPhone = '';

            if (file.billToDetails) {
                customerName = file.billToDetails.Name || file.billToDetails.CompanyName || '';
                customerEmail = file.billToDetails.Email || '';
                customerPhone = file.billToDetails.Phone || '';
            }

            // If no stored total, try to parse from content (fallback for legacy invoices)
            if (totalAmount === 0 && file.content && file.templateId) {
                try {
                    // Decode content
                    const mscContent = JSON.parse(decodeURIComponent(file.content));

                    // Get the save string (assuming single sheet or first sheet)
                    const sheetName = mscContent.currentid || 'sheet1';
                    const sheetData = mscContent.sheetArr?.[sheetName];

                    if (sheetData?.sheetstr?.savestr) {
                        const saveStr = sheetData.sheetstr.savestr;
                        const lines = saveStr.split('\n');
                        const cellValues = new Map<string, string>();

                        // Parse cells
                        lines.forEach((line: string) => {
                            if (line.startsWith('cell:')) {
                                const parts = line.split(':');
                                const coord = parts[1];

                                let value = '';
                                for (let i = 2; i < parts.length; i++) {
                                    if (parts[i] === 'v') {
                                        value = parts[i + 1];
                                        break;
                                    } else if (parts[i] === 't') {
                                        value = parts[i + 1];
                                        break;
                                    }
                                }

                                if (value) {
                                    cellValues.set(coord, value);
                                }
                            }
                        });

                        // Try common total cell locations
                        const possibleTotalCells = ['F36', 'G36', 'E36', 'F30', 'G30'];
                        for (const totalCell of possibleTotalCells) {
                            if (cellValues.has(totalCell)) {
                                const val = parseFloat(cellValues.get(totalCell) || '0');
                                if (!isNaN(val) && val > 0) {
                                    totalAmount = val;
                                    break;
                                }
                            }
                        }
                    }
                } catch (e) {
                    // Silently fail for legacy content parsing
                }
            }

            // Clean up customer info
            customerName = customerName.replace(/^\[|\]$/g, '').trim();
            if (customerName === 'Name' || customerName === '[Name]') customerName = '';

            // Process invoice if we have a total amount (including 0 for valid invoices)
            if (totalAmount >= 0) {
                analytics.totalRevenue += totalAmount;
                analytics.totalInvoices++;

                // Use createdAt, modifiedAt, or created for date
                const dateStr = file.createdAt || file.modifiedAt || file.created || new Date().toISOString();
                const date = new Date(dateStr);
                const monthKey = date.toLocaleString('default', { month: 'short' });

                analytics.revenueByMonth[monthKey] = (analytics.revenueByMonth[monthKey] || 0) + totalAmount;

                const gst = totalAmount * 0.18;
                analytics.gstByMonth[monthKey] = (analytics.gstByMonth[monthKey] || 0) + gst;

                analytics.recentActivity.push({
                    date: dateStr,
                    amount: totalAmount,
                    fileName: file.name || file.id
                });

                // Process Customer
                if (customerName) {
                    const key = customerEmail || customerPhone || customerName;
                    const existing = customerMap.get(key) || {
                        name: customerName,
                        email: customerEmail,
                        phone: customerPhone,
                        totalSpent: 0,
                        invoiceCount: 0,
                        lastPurchase: dateStr
                    };

                    existing.totalSpent += totalAmount;
                    existing.invoiceCount++;
                    if (new Date(dateStr) > new Date(existing.lastPurchase)) {
                        existing.lastPurchase = dateStr;
                    }

                    customerMap.set(key, existing);
                }
            }

        } catch (e) {
            console.error("Error processing file for analytics", file.name || file.id, e);
        }
    });

    // Finalize
    analytics.averageInvoiceValue = analytics.totalInvoices > 0
        ? analytics.totalRevenue / analytics.totalInvoices
        : 0;

    analytics.topItems = Array.from(itemMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    analytics.customers = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);

    analytics.recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    analytics.recentActivity = analytics.recentActivity.slice(0, 10);

    return analytics;
};

export type TimeRange = '7d' | '30d' | '90d' | '6m' | '1y';

export const processRevenueChartData = (files: any[], timeRange: TimeRange) => {
    const now = new Date();
    const startDate = new Date();

    // Set start date based on range
    switch (timeRange) {
        case '7d': startDate.setDate(now.getDate() - 7); break;
        case '30d': startDate.setDate(now.getDate() - 30); break;
        case '90d': startDate.setDate(now.getDate() - 90); break;
        case '6m': startDate.setMonth(now.getMonth() - 6); break;
        case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
    }

    // Determine grouping (Daily for <= 90d, Monthly for > 90d)
    const isDaily = ['7d', '30d', '90d'].includes(timeRange);

    const dataMap = new Map<string, number>();
    const labels: string[] = [];

    // Initialize labels and map with 0s
    if (isDaily) {
        for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dataMap.set(label, 0);
            labels.push(label);
        }
    } else {
        // Monthly grouping
        for (let d = new Date(startDate); d <= now; d.setMonth(d.getMonth() + 1)) {
            const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            dataMap.set(label, 0);
            labels.push(label);
        }
    }

    // Process files
    files.forEach(file => {
        try {
            const dateStr = file.createdAt || file.modifiedAt || file.created;
            if (!dateStr) return;

            const date = new Date(dateStr);
            if (date < startDate || date > now) return;

            let amount = 0;
            if (file.total !== undefined && file.total !== null) {
                amount = typeof file.total === 'number' ? file.total : parseFloat(file.total) || 0;
            } else if (file.content) {
                // Try legacy extraction if needed, similar to parseInvoiceData
                try {
                    const mscContent = JSON.parse(decodeURIComponent(file.content));
                    if (mscContent?.total) amount = parseFloat(mscContent.total) || 0;
                } catch (e) {
                    // Legacy content format couldn't be parsed - skip this entry
                    if (import.meta.env.DEV) console.warn('Failed to parse legacy invoice content:', e);
                }
            }

            if (amount > 0) {
                let label = '';
                if (isDaily) {
                    label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                } else {
                    label = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                }

                if (dataMap.has(label)) {
                    dataMap.set(label, (dataMap.get(label) || 0) + amount);
                }
            }
        } catch (e) {
            console.error("Error processing file for chart", e);
        }
    });

    return {
        labels,
        data: labels.map(label => dataMap.get(label) || 0)
    };
};
