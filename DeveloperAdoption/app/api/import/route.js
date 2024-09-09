import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parse } from 'papaparse';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('upload');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    const fileBuffer = await file.arrayBuffer();

    let data;
    if (fileName.endsWith('.csv')) {
      data = await processCsv(fileBuffer);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      data = await processExcel(fileBuffer);
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const jsonString = convertToSocialCalcFormat(data);

    return NextResponse.json({ data: jsonString }, { status: 200 });
  } catch (error) {
    console.error('Error in import process:', error);
    return NextResponse.json({ error: 'Failed to process file: ' + error.message }, { status: 500 });
  }
}

async function processCsv(buffer) {
  const text = new TextDecoder().decode(buffer);
  return new Promise((resolve, reject) => {
    parse(text, {
      complete: (results) => resolve(results.data),
      error: (error) => reject(error),
      skipEmptyLines: true
    });
  });
}

async function processExcel(buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
}

function convertToSocialCalcFormat(data) {
  let cells = '';
  data.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell !== '') {
        const colLetter = String.fromCharCode(65 + colIndex);
        cells += `cell:${colLetter}${rowIndex + 1}:t:${cell}\n`;
      }
    });
  });

  const socialCalcData = {
    "sheetArr": {
      "sheet1": {
        "sheetstr": {
          "savestr": cells
        },
        "name": "sheet1",
        "hidden": "0"
      }
    },
    "numsheets": 1,
    "currentid": "sheet1",
    "currentname": "sheet1"
  };

  return JSON.stringify(socialCalcData);
}