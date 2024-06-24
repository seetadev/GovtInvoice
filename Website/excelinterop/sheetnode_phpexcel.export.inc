<?php

function _sheetnode_phpexcel_export($format, $node) {
  require_once(drupal_get_path('module', 'sheetnode') . '/socialcalc.inc');
  if (!$node || $node->type != 'sheetnode') return drupal_not_found();
  return _sheetnode_phpexcel_export_do($format, $node->title, socialcalc_parse(_sheetnode_load($node->nid, $node->vid)));
}

//function _sheetnode_phpexcel_export_do($format, $title, $socialcalc) {
//  require_once(variable_get('sheetnode_phpexcel_library_path', '') . '/Classes/PHPExcel.php');

function _sheetnode_phpexcel_export_do($workbook, $title, $sc) {
  // Create new PHPExcel object
  //$sc = $socialcalc['sheet'];
  //$workbook = new PHPExcel();

  // Title
  try {
    // TODO: Split titles with format "Spreadsheet > Workbook" and sanitize.
    $workbook->getActiveSheet()->SetTitle($title);
  }
  catch (Exception $e) {
    watchdog('sheetnode_phpexcel', 'Error setting worksheet title to "!title": @error', array('!title' => $title, '@error' => $e->getMessage()), WATCHDOG_WARNING);
  }

/*
  // TODO: Properties
  $workbook->getProperties()->setCreator("Maarten Balliauw")
                 ->setLastModifiedBy("Maarten Balliauw")
                 ->setTitle("Office 2007 XLSX Test Document")
                 ->setSubject("Office 2007 XLSX Test Document")
                 ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
                 ->setKeywords("office 2007 openxml php")
                 ->setCategory("Test result file");
*/
  // Names
  // TODO: Not supported in Excel5.
  if (!empty($sc['names'])) foreach ($sc['names'] as $n => $info) {
    // TODO: Support external references.
    $workbook->addNamedRange(new PHPExcel_NamedRange($n, $workbook->getActiveSheet(), $info['definition']));
  }

  // Cells
  if ($sc['cells']) foreach ($sc['cells'] as $coord => $c) {
    // Value and format
    _sheetnode_phpexcel_export_cell_value_and_format($c, $coord, $sc, $workbook->getActiveSheet()); 

    // Comment
    // TODO: Not supported in Excel5.
    if (!empty($c['comment'])) {
      $workbook->getActiveSheet()->getComment($coord)->getText()->createTextRun($c['comment']);
    }

    // Font
    $style = $workbook->getActiveSheet()->getStyle($coord);
    if (!empty($c['font'])) {
      $scf = socialcalc_cellformat_parsefont($c, $sc);
      $font = $style->getFont();
      if (!empty($scf['family'])) $font->setName($scf['family']);
      if (!empty($scf['size'])) $font->setSize(floatval($scf['size']));
      if (!empty($scf['bold'])) $font->setBold(true);
      if (!empty($scf['italic'])) $font->setItalic(true);
      if (!empty($c['color'])) {
        $scc = socialcalc_cellformat_parsecolor($c, $sc, 'color');
        $rgb = sprintf('%02X%02X%02X', $scc['r'], $scc['g'], $scc['b']);
        $font->getColor()->setRGB($rgb);
      }
    }

    // Borders
    foreach (array(
      'br' => 'getRight', 
      'bl' => 'getLeft', 
      'bt' => 'getTop', 
      'bb' => 'getBottom',
    ) as $pos => $method) {
      $border = socialcalc_cellformat_parseborder($c, $sc, $pos);
      if (empty($border)) continue;
      $borderobj = $style->getBorders()->$method();
      $thickness = str_replace('px', '', $border['thickness']); // TODO: what about other units?
      if ($thickness > 0 && $thickness < 7) {
        $thickness = 'thin';
      }
      else if ($thickness > 7 && $thickness < 15) {
        $thickness = 'medium';
      }
      else if ($thickness > 15) {
        $thickness = 'thick';
      }
      $borderstyles = array(
        'thin' => array(
          'solid' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
          'dashed' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DASHED,
          'dotted' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DOTTED,
          'double' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DOUBLE,
        ),
        'medium' => array(
          'solid' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM,
          'dashed' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUMDASHED,
        ),
        'thick' => array(
          'solid' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK,
        ),
      );
      // TODO: what about other combinations?
      $borderstyle = isset($borderstyles[$thickness][$border['style']]) ? $borderstyles[$thickness][$border['style']] : \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN;
      $borderobj->setBorderStyle($borderstyle);
      $scc = $border['color'];
      $rgb = sprintf('%02X%02X%02X', $scc['r'], $scc['g'], $scc['b']);
      $borderobj->getColor()->setRGB($rgb);
    }

    // Background color
    if (!empty($c['bgcolor'])) {
      $scc = socialcalc_cellformat_parsecolor($c, $sc, 'bgcolor');
      $rgb = sprintf('%02X%02X%02X', $scc['r'], $scc['g'], $scc['b']);
      $style->getFill()->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID);
      $style->getFill()->getStartColor()->setRGB($rgb);
    }

    // Alignment
    if (!empty($c['cellformat'])) {
      $alignments = array(
        'left' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT,
        'right' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT,
        'center' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
      );
      $alignment = isset($alignments[$sc['cellformats'][$c['cellformat']]]) ? $alignments[$sc['cellformats'][$c['cellformat']]] : NULL;
      if ($alignment) {
        $style->getAlignment()->setHorizontal($alignment);
      }
    }

    // Vertical Alignment
    $layout = socialcalc_cellformat_parselayout($c, $sc);
    if (!empty($layout['alignvert'])) {
      $valignments = array(
        'top' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP,
        'bottom' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_BOTTOM,
        'middle' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
      );
      $valignment = isset($valignments[$layout['alignvert']]) ? $valignments[$layout['alignvert']] : NULL;
      if ($valignment) {
        $style->getAlignment()->setVertical($valignment);
      }
    }

    // Merged regions
if (isset($c['colspan']) && isset($c['rowspan']) && ($c['colspan'] > 1 || $c['rowspan'] > 1)) {
    $colspan = isset($c['colspan']) ? $c['colspan'] : 1;
    $rowspan = isset($c['rowspan']) ? $c['rowspan'] : 1;
    $coord2 = socialcalc_cr_to_coord($c['pos'][0] + max($colspan - 1, 0), $c['pos'][1] + max($rowspan - 1, 0));
    $workbook->getActiveSheet()->mergeCells($coord . ':' . $coord2);
}
  }

  // Columns
$defaultStyle = $workbook->getDefaultStyle();
$defaultFont = $defaultStyle->getFont();

if (!empty($sc['colattribs']['width'])) {
    foreach ($sc['colattribs']['width'] as $c => $width) {
        $columnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($c - 1);
        $worksheet = $workbook->getActiveSheet();
        $worksheet->getColumnDimension($columnIndex)->setWidth($width);
    }
}

  // Rows
  if (!empty($sc['rowattribs']['height'])) foreach($sc['rowattribs']['height'] as $r => $height) {
    $workbook->getActiveSheet()->getRowDimension($r)->setRowHeight($height);
  }

  // Test formulas and replace with calculated value upon failure.
  foreach ($workbook->getActiveSheet()->getCellCollection() as $cellID) {
    $cell = $workbook->getActiveSheet()->getCell($cellID);
    if ($cell->getDatatype() == \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA) {
      try {
        //$cell->getCalculatedValue(); // don't care about return value
	$coord = $cell->getCoordinate();
        $cell->setValue($sc['cells'][$coord]['datavalue']);
      }
      catch (Exception $e) {
        $coord = $cell->getCoordinate();
        $cell->setValue($sc['cells'][$coord]['datavalue']);
        $comment = t(variable_get('sheetnode_phpexcel_bad_formula', 'Could not export formula !formula.'), array('!formula' => $sc['cells'][$coord]['formula']));
        $workbook->getActiveSheet()->getComment($coord)->getText()->createTextRun($comment);
      }
    }
  }
  //return '';

  // Redirect output to a client’s web browser.
  //$plugins = sheetnode_phpexcel_get_plugins();
  //$plugin = $plugins[$format];
  //header('Content-Type: ' . $plugin['content-type']);
  //header('Content-Disposition: attachment;filename="' . _sheetnode_sanitize_filename($title, $format) . '"');
  //header('Cache-Control: max-age=0');

  //$writer = PHPExcel_IOFactory::createWriter($workbook, $plugin['php-excel-type']);
  //$writer->save('php://output');
  //exit;
  return;
}

function _sheetnode_phpexcel_export_cell_value_and_format($c, $coord, $sc, $worksheet) {
  // Taken from socialcalc-3.js:SocialCalc.FormatValueForDisplay().
  $cell = $worksheet->getCell($coord);
  $style = $worksheet->getStyle($coord);

  $valuetype = substr($c['valuetype'], 0, 1);
  $valuesubtype = substr($c['valuetype'], 1);
  $displayvalue = $c['datavalue'];
  $valueformat = NULL;
  
  // Error.
  if (!empty($c['errors']) || $valuetype == 'e') {
    $displayvalue = !empty($c['errors']) ? $c['errors'] : (!empty($valuesubtype) ? $valuesubtype : t('Unknown error'));
    $cell->setValueExplicit($displayvalue, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_ERROR);
  }
  // Text.
  else if ($valuetype == 't') {
    // Get formatting.
    $valueformat = !empty($c['textvalueformat']) ? $sc['valueformats'][$c['textvalueformat']] : (
                   !empty($sc['defaulttextvalueformat']) ? $sc['valueformats'][$sc['defaulttextvalueformat']] : NULL);
    if (in_array(strtolower($valueformat), array('auto', 'none', 'general'))) {
      $valueformat = NULL;
    }

    // Default text formatting based on cell type.
    if (empty($valueformat)) switch ($valuesubtype) {
    case 'h':
      $valueformat = 'text-html';
      break;
    case 'w':
    case 'r':
      $valueformat = 'text-wiki';
      break;
    case 'l':
      $valueformat = 'text-link';
      break;
    default:
      $valueformat = 'text-plain';
      break;
    }

    // Set the value.
    if ($c['datatype'] == 'f') {
      $cell->setValue('='. $c['formula']);
    }
    else switch ($valueformat) {
    case 'text-plain':
      $cell->setValueExplicit($displayvalue, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
      break;
    case 'text-html':
      // TODO: Parse HTML into rich text.
      $cell->setValueExplicit(strip_tags($displayvalue), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
      break;
    case 'text-url':
    case 'text-link':
      $matches = array();
      if (preg_match('/^(.*)<(.*)>$/', $displayvalue, $matches)) {
        $text = trim($matches[1], "\r\n\t \"");
        $url = $matches[2];
      }
      else {
        $url = $displayvalue;
        $parse_url = parse_url($url);
        $text = $parse_url['host'] . $parse_url['path'];
      }
      $cell->setValueExplicit($text, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
      $cell->getHyperlink()->setUrl($url);
      break;
    case 'text-wiki':
      // TODO
      break;
    case 'text-image':
      if (function_exists('curl_init')) {
        // Download the file using cURL.
        $ch = curl_init($displayvalue);
        $filename = tempnam(file_directory_temp(), 'sheetnode_phpexcel_');
        $fp = fopen($filename, 'wb');
        $options = array(CURLOPT_FILE => $fp,
                         CURLOPT_HEADER => 0,
                         CURLOPT_FOLLOWLOCATION => 1,
                         CURLOPT_TIMEOUT => 60);
        curl_setopt_array($ch, $options);
        curl_exec($ch);
        curl_close($ch);
        fclose($fp);
        $image_info = image_get_info($filename);
        if (!empty($image_info)) {
          // Insert the image in the PHPExcel file.
          $objDrawing = new PHPExcel_Worksheet_Drawing();
          $objDrawing->setPath($filename);
          $objDrawing->setCoordinates($coord);
          $objDrawing->setWidth($image_info['width']);
          $objDrawing->setWorksheet($worksheet);
        }
      }
      break;
    case 'hidden':
      // TODO 
      break;
    case 'formula':
      // TODO
      break;
    default:
      if (substr($valueformat, 0, 12) == 'text-custom:') {
        // TODO
      }
      else if (substr($valueformat, 0, 6) == 'custom') {
        // TODO
      }
      else {
        $cell->setValue($displayvalue);
      }
      break;
    }
  }
  // Number.
  else if ($valuetype == 'n') {
    // Get formatting.
    $valueformat = !empty($c['nontextvalueformat']) ? $sc['valueformats'][$c['nontextvalueformat']] : (
                   !empty($sc['defaultnontextvalueformat']) ? $sc['valueformats'][$sc['defaultnontextvalueformat']] : NULL);
    if ($valueformat !== null && in_array(strtolower($valueformat), array('auto', 'none'))) {
    $valueformat = null; // Assign null instead of NULL for consistency
}

    // Default number formatting based on cell type.
    if (empty($valueformat)) switch ($valuesubtype) {
    case '%':
      $valueformat = SocialCalc_Constants::$defaultFormatp; 
      break;
    case '$':
      $valueformat = SocialCalc_Constants::$defaultFormatc; 
      break;
    case 'dt':
      $valueformat = SocialCalc_Constants::$defaultFormatdt; 
      break;
    case 'd':
      $valueformat = SocialCalc_Constants::$defaultFormatd; 
      break;
    case 't':
      $valueformat = SocialCalc_Constants::$defaultFormatt; 
      break;
    case 'l':
      $valueformat = 'logical';
      break;
    default:
      $valueformat = \PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_GENERAL; 
      break;
    }

    // Set the value.
    if ($c['datatype'] == 'f') {
      $cell->setValue('='. $c['formula']);
    }
    else if ($valueformat == 'logical') {
      $displayvalue = empty($displayvalue) ? SocialCalc_Constants::$defaultDisplayFALSE : SocialCalc_Constants::$defaultDisplayTRUE;
      $cell->setValue($displayvalue);
      $valueformat = NULL;
    }
    else if ($valueformat == 'formula') {
      $cell->setValueExplicit('='. $c['formula'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    }
    else if ($valueformat == 'forcetext') {
      $cell->setValueExplicit($displayvalue, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
    }
    else {
      $cell->setValueExplicit($displayvalue, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
    }

    // Set the formatting.
    if ($valueformat == 'hidden') {
      // TODO
    }
    else if (!empty($valueformat)) {
      $style->getNumberFormat()->setFormatCode($valueformat);
    }
  }
  // Unknown.
  else {
    $cell->setValueExplicit('', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NULL);
  }
}

