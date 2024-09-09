import * as XLSX from 'xlsx';
import { unparse } from 'papaparse';
import { NextResponse } from 'next/server';

function socialCalcToJson(socialCalcData) {

  if (typeof socialCalcData === 'string') {
    try {
      socialCalcData = JSON.parse(socialCalcData);
    } catch (error) {
      console.error('Error parsing JSON string:', error);
      throw new Error('Invalid JSON string');
    }
  }

  if (!socialCalcData || !socialCalcData.sheetArr || !socialCalcData.currentid) {
    console.error('Invalid SocialCalc data structure:', JSON.stringify(socialCalcData));
    throw new Error('Invalid SocialCalc data structure');
  }

  const sheet = socialCalcData.sheetArr[socialCalcData.currentid];
  if (!sheet || !sheet.sheetstr || !sheet.sheetstr.savestr) {
    console.error('Invalid sheet structure:', JSON.stringify(sheet));
    throw new Error('Invalid sheet structure');
  }

  const cells = sheet.sheetstr.savestr.split('\n');
  const cellData = {};
  let maxRow = 0;
  let maxCol = 0;

  cells.forEach(cell => {
    if (cell.startsWith('cell:')) {
      const [, cellRef, , value] = cell.split(':');
      const match = cellRef.match(/([A-Z]+)(\d+)/);
      if (match) {
        const [, colLetters, rowNum] = match;
        const row = parseInt(rowNum, 10);
        const col = colLetters.split('').reduce((acc, letter) => acc * 26 + letter.charCodeAt(0) - 64, 0);
        cellData[`${row},${col}`] = value || '';
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
      }
    }
  });

  console.log(`Max row: ${maxRow}, Max col: ${maxCol}`);

  // Create rows with proper length
  const rows = [];
  for (let i = 1; i <= maxRow; i++) {
    const row = new Array(maxCol).fill('');
    for (let j = 1; j <= maxCol; j++) {
      row[j-1] = cellData[`${i},${j}`] || '';
    }
    rows.push(row);
  }

  console.log('Processed rows:', JSON.stringify(rows));
  return rows;
}

function manualCsvGeneration(rows) {
  return rows.map(row => row.map(cell => {
    if (cell === null || cell === undefined) return '';
    return `"${String(cell).replace(/"/g, '""')}"`;
  }).join(',')).join('\n');
}

export async function POST(req) {
  try {
    const data = await req.formData();
    const type = data.get('type');
    let content = data.get('content');
    let fileBuffer;
    let fileType;
    let fileName;

    // Parse content if it's a string
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (error) {
        console.error('Error parsing content JSON:', error);
        return NextResponse.json({ error: 'Invalid JSON content' }, { status: 400 });
      }
    }

    const rows = socialCalcToJson(content);
    console.log('Rows after socialCalcToJson:', JSON.stringify(rows));

    if (type === 'excel') {
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      fileBuffer = Buffer.from(excelBuffer);
      fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileName = 'sheet.xlsx';
    } else if (type === 'csv') {
      if (!Array.isArray(rows) || rows.length === 0) {
        console.error('Invalid rows data for CSV:', JSON.stringify(rows));
        throw new Error('No valid data to convert to CSV');
      }
      let csvString;
      try {
        console.log('Attempting to use PapaParse');
        csvString = unparse(rows);
        console.log('PapaParse successful');
      } catch (error) {
        console.error('PapaParse failed, using manual CSV generation:', error);
        csvString = manualCsvGeneration(rows);
      }
      fileBuffer = Buffer.from(csvString);
      fileType = 'text/csv';
      fileName = 'sheet.csv';
    } else {
      return NextResponse.json({ error: 'Invalid type specified' }, { status: 400 });
    }

    console.log('File created successfully');
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': fileType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error in POST function:', error);
    return NextResponse.json({ error: 'Failed to process request: ' + error.message }, { status: 500 });
  }
}