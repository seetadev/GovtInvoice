<?php

require 'vendor/autoload.php'; // Composer autoload

use PhpOffice\PhpSpreadsheet\IOFactory;

require_once 'excelinterop/socialcalc.inc';
require_once 'excelinterop/sheetnode_phpexcel.import.inc';

$inputFile = $argv[1];

$spreadsheet = IOFactory::load($inputFile);

$sheetCount = $spreadsheet->getSheetCount();

$book = [
    'numsheets' => $sheetCount,
    'currentname' => $spreadsheet->getActiveSheet()->getTitle(),
    'sheetArr' => [],
];

foreach ($spreadsheet->getSheetNames() as $index => $sheetName) {
    $sheet = $spreadsheet->getSheet($index);
    $sheetSave = _sheetnode_phpexcel_import_do($spreadsheet, $sheet);

    $sheetData = [
        'name' => $sheetName,
        'sheetstr' => [
            'savestr' => $sheetSave,
        ],
    ];

    $book['sheetArr']["Sheet$index"] = $sheetData;

    if ($sheetName == $book['currentname']) {
        $book['currentid'] = "Sheet$index";
    }
}

$json = json_encode($book);

echo "$---$"; // Output delimiter (assuming for parsing purposes)
echo $json;