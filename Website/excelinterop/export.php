<?php

require 'vendor/autoload.php'; // Composer autoload

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\IOFactory;

require_once 'excelinterop/socialcalc.inc';
require_once 'excelinterop/sheetnode_phpexcel.export.inc';

// Read the tmp file
$fname = $argv[1];
$outfile = $argv[2];
$outfiletype = $argv[3];

$fh = fopen($fname, "r");
$data = fread($fh, filesize($fname));
fclose($fh);

$book = json_decode($data);

$sheetarr = $book->sheetArr;
$workbook = new Spreadsheet();

$sindex = 0;
$actualactiveindex = 0;

foreach ($sheetarr as $key => $value) {
    if ($sindex > 0) {
        $workbook->createSheet();
        $workbook->setActiveSheetIndex($sindex);
    }
    if ($key == $book->currentid) {
        $actualactiveindex = $sindex;
    }

    $title = $value->name;
    $sheet = socialcalc_parse_sheet($value->sheetstr->savestr);

    _sheetnode_phpexcel_export_do($workbook, $title, $sheet);

    $sindex++;
    echo $sindex . ' done' . PHP_EOL;
}

$workbook->setActiveSheetIndex($actualactiveindex);

// Write the workbook into a file
$objWriter = IOFactory::createWriter($workbook, $outfiletype);
$objWriter->save($outfile);

?>