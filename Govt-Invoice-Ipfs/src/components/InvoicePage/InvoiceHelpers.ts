// InvoicePage Helper Functions
// Extracted from InvoicePage.tsx for cleaner code organization

import { AppMappingItem } from '../../types/template';

/**
 * Helper function to generate editable cells from appMapping
 */
export const generateEditableCells = (
    appMapping: any,
    sheetName: string = 'sheet1'
): { allow: boolean; cells: { [key: string]: boolean }; constraints: {} } => {
    const cells: { [key: string]: boolean } = {};

    const processItem = (item: AppMappingItem, currentSheet: string) => {
        if (item.type === 'text' && item.editable && item.cell) {
            cells[`${currentSheet}!${item.cell}`] = true;
        }
        // Handle form types with nested formContent
        if (item.type === 'form' && item.editable && item.formContent) {
            for (const [fieldKey, fieldItem] of Object.entries(item.formContent)) {
                if ((fieldItem as AppMappingItem).editable && (fieldItem as AppMappingItem).cell) {
                    cells[`${currentSheet}!${(fieldItem as AppMappingItem).cell}`] = true;
                }
            }
        }
        // Handle table rows
        if (item.type === 'table' && item.rows && item.col) {
            for (const [colKey, colItem] of Object.entries(item.col)) {
                if ((colItem as AppMappingItem).editable && (colItem as AppMappingItem).cell) {
                    const cellRef = (colItem as AppMappingItem).cell!;
                    const colLetter = cellRef.replace(/[0-9]/g, '');
                    for (let row = item.rows.start; row <= item.rows.end; row++) {
                        cells[`${currentSheet}!${colLetter}${row}`] = true;
                    }
                }
            }
        }
    };

    // Process all sheets in appMapping
    for (const [sheet, mappings] of Object.entries(appMapping || {})) {
        for (const [header, item] of Object.entries(mappings as any || {})) {
            processItem(item as AppMappingItem, sheet);
        }
    }

    return { allow: true, cells, constraints: {} };
};

/**
 * Helper function to extract total from a specific cell
 */
export const extractTotalFromCell = (
    appMapping: any,
    sheetName: string = 'sheet1'
): string | null => {
    const sheetMapping = appMapping?.[sheetName];
    if (!sheetMapping) return null;

    // Look for "Total" or "Grand Total" key
    const totalItem = sheetMapping['Total'] || sheetMapping['Grand Total'] || sheetMapping['total'];
    if (totalItem && totalItem.cell) {
        return totalItem.cell;
    }
    return null;
};
