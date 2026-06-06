export interface TemplateMeta {
    id: number;
    name: string;
    device: "mobile" | "tablet" | "desktop";
    type: "invoice" | "receipt" | "purchase_order" | "quotation" | "other";
    description: string;
    isPremium: boolean;
    price: { [key: string]: number };
    image: string;
    hashtag?: string[];
}

export interface AppMappingItem {
    type: "text" | "image" | "table" | "form";
    cell?: string;
    editable?: boolean;
    unitname?: string;
    rows?: { start: number; end: number };
    col?: { [columnKey: string]: AppMappingItem };
    name?: string;
    formContent?: { [key: string]: AppMappingItem };
}

export interface TemplateData {
    mainSheet?: string; // The primary sheet to use for metadata extraction
    msc: {
        numsheets: number;
        currentid: string;
        currentname: string;
        sheetArr: {
            [sheetName: string]: {
                sheetstr: {
                    savestr: string;
                };
                name: string;
                hidden: string;
            };
        };
        EditableCells: {
            allow: boolean;
            cells: {
                [cellName: string]: boolean;
            };
            constraints: {
                [cellName: string]: [string, string, string, string];
            };
        };
    };
    footers: { name: string; index: number; isActive: boolean }[];
    appMapping: {
        [sheetName: string]: {
            [header: string]: AppMappingItem;
        };
    };
}
