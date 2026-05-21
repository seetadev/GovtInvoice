export interface CsvExportResult {
  csv: string;
  filename: string;
}

type CellRef = {
  col: number;
  row: number;
};

const decodeSocialCalcValue = (value: string): string =>
  value.replace(/\\c/g, ":").replace(/\\n/g, "\n").replace(/\\b/g, "\\");

const colLetterToIndex = (col: string): number => {
  let index = 0;
  for (let i = 0; i < col.length; i++) {
    index = index * 26 + (col.charCodeAt(i) - 64);
  }
  return index;
};

const parseCellRef = (ref: string): CellRef | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  return { col: colLetterToIndex(match[1]), row: parseInt(match[2], 10) };
};

const getCellValue = (parts: string[]): string => {
  const type = parts[2];

  if (type === "v" || type === "t") {
    return decodeSocialCalcValue(parts[3] ?? "");
  }

  if (type === "vt" || type === "vtf" || type === "vtc") {
    return decodeSocialCalcValue(parts[4] ?? "");
  }

  return "";
};

const escapeCsvCell = (cell: string): string => {
  const escaped = cell.replace(/"/g, '""');
  return /[",\n\r]/.test(escaped) ? `"${escaped}"` : escaped;
};

export function convertSpreadsheetToCSV(
  spreadsheetContent: string,
  invoiceName: string
): CsvExportResult {
  const grid: Record<number, Record<number, string>> = {};
  let maxRow = 0;
  let maxCol = 0;

  spreadsheetContent.split("\n").forEach((line) => {
    if (!line.startsWith("cell:")) return;

    const parts = line.split(":");
    if (parts.length < 4) return;

    const ref = parseCellRef(parts[1]);
    if (!ref) return;

    const value = getCellValue(parts);
    if (!grid[ref.row]) grid[ref.row] = {};
    grid[ref.row][ref.col] = value;

    maxRow = Math.max(maxRow, ref.row);
    maxCol = Math.max(maxCol, ref.col);
  });

  const csvRows: string[] = [];
  for (let row = 1; row <= maxRow; row++) {
    const rowCells: string[] = [];
    for (let col = 1; col <= maxCol; col++) {
      rowCells.push(escapeCsvCell(grid[row]?.[col] ?? ""));
    }

    if (rowCells.some((cell) => cell !== "")) {
      csvRows.push(rowCells.join(","));
    }
  }

  const safeName = invoiceName.replace(/[^a-zA-Z0-9-_]/g, "_") || "invoice";
  const filename = `${safeName}_${new Date().toISOString().slice(0, 10)}.csv`;

  return {
    csv: csvRows.join("\n"),
    filename,
  };
}
