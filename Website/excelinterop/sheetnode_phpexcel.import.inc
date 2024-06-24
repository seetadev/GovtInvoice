<?php

function _sheetnode_phpexcel_import_form(&$form_state, $format) {
  $form['#attributes'] = array('enctype' => "multipart/form-data");
  $plugins = sheetnode_phpexcel_get_plugins();
  $form['#plugin'] = $plugins[$format];
  $form['import'] = array(
    '#type' => 'file',
    '#title' => t('!format to import', array('!format' => $form['#plugin']['long-name'])),
    '#size' => 40,
  );
  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Submit'),
  );
  return $form;
}

function _sheetnode_phpexcel_import_form_validate($form, &$form_state) {
  $source = $_FILES['files']['name']['import'];

  // Handle PHP file upload errors.
  switch ($_FILES['files']['error']['import']) {
  case UPLOAD_ERR_OK:
    break;
  case UPLOAD_ERR_FORM_SIZE:
  case UPLOAD_ERR_INI_SIZE:
    form_set_error('import', t('The file %file could not be saved, because it exceeds %maxsize, the maximum allowed size for uploads. Please choose a smaller file or notify your site administrator.', 
      array('%file' => $source, '%maxsize' => format_size(file_upload_max_size()))));
    return;
  case UPLOAD_ERR_PARTIAL:
    form_set_error('import', t('The file %file could not be saved, because the upload did not complete. Please try again or notify your site administrator.', array('%file' => $source)));
    return;
  case UPLOAD_ERR_NO_FILE:
    form_set_error('import', t('No file was uploaded. Please choose a file to upload.'));
    return;
  case UPLOAD_ERR_NO_TMP_DIR:
    form_set_error('import', t('The file %file could not be saved, because the temporary upload folder is missing. Please notify your site administrator.', array('%file' => $source)));
    return;
  case UPLOAD_ERR_CANT_WRITE:
    form_set_error('import', t('The file %file could not be saved, because a failure occurred while writing it to the temporary folder. Please notify your site administrator.', array('%file' => $source)));
    return;
  case UPLOAD_ERR_EXTENSION:
    form_set_error('import', t('The file %file could not be saved, because its extension is disallowed. Please notify your site administrator.', array('%file' => $source)));
    return;
  default:
    form_set_error('import', t('The file %file could not be saved. An unknown error %error has occurred. Please notify your site administrator.', 
      array('%file' => $source, '%error' => $_FILES['files']['error']['import'])));
    return;
  }

  // TODO: Validate that file is of type $form['#plugin'].
}

function _sheetnode_phpexcel_import_form_submit($form, &$form_state) {
  require_once(variable_get('sheetnode_phpexcel_library_path', '') . '/Classes/PHPExcel.php');
  module_load_include('inc', 'node', 'node.pages');
  set_time_limit(0);
  global $user;

  // Open sheet file.
  // TODO: What to do with other properties?
  $workbook = PHPExcel_IOFactory::load($_FILES['files']['tmp_name']['import']);
  $title = $workbook->getProperties()->getTitle();
  if (empty($title)) {
    $title = pathinfo($_FILES['files']['name']['import'], PATHINFO_FILENAME);
  }
  $description = $workbook->getProperties()->getDescription();

  // Create a book if there are more than one sheet.
  $numsheets = $workbook->getSheetCount();
  if ($numsheets > 1 && module_exists('book')) {
    $node = array('type' => 'book');
    $form_state_book = array();
    $form_state_book['values']['title'] = $title;
    $form_state_book['values']['body'] = $description;
    $form_state_book['values']['name'] = $user->name;
    $form_state_book['values']['op'] = t('Save');
    $form_state_book['values']['book']['bid'] = 'new';
    $form_state_book['values']['book']['plid'] = -1;
    $form_state_book['values']['book']['weight'] = 0;
    drupal_execute('book_node_form', $form_state_book, (object)$node);
    $book = node_load($form_state_book['nid']);
  }

  // Import all sheets.
  for ($s = 0; $s < $numsheets; $s++) {
    $sheet = $workbook->getSheet($s);
    $node = array('type' => 'sheetnode');
    $form_state_node = array();
    $form_state_node['values']['title'] = (empty($book) ? $title .' > ' : '') . $sheet->getTitle();
    $form_state_node['values']['body'] = empty($book) ? $description : '';
    $form_state_node['values']['name'] = $user->name;
    $form_state_node['values']['sheetsave'] = _sheetnode_phpexcel_import_do($workbook, $sheet);
    $form_state_node['values']['op'] = t('Save');
    if (!empty($book)) { // insert inside the book
      $form_state_node['values']['book']['bid'] = $book->nid;
      $form_state_node['values']['book']['plid'] = $book->book['mlid'];
      $form_state_node['values']['book']['weight'] = $s;
    }
    // Allow other modules to modify the new node's creation parameters.
    // Hook signature: hook_sheetnode_alter(&$form_state_node, $form, $form_state);
    drupal_alter('sheetnode', $form_state_node, $form, $form_state);

    drupal_execute('sheetnode_node_form', $form_state_node, (object)$node);
  }

  // If more than one sheet, create a book to hold them
  if (!empty($book)) {
    $form_state['redirect'] = 'node/'. $book->nid;
  }
  else {
    $form_state['redirect'] = 'node/'. $form_state_node['nid'];
  }
}

function _sheetnode_phpexcel_import_do($workbook, $sheet) {
  //require_once(drupal_get_path('module', 'sheetnode') . '/socialcalc.inc');
  //  require_once 'socialcalc.inc';
  $sc = array(); // SocialCalc array structure

  // Default values.
  $defaultFont = $sheet->getParent()->getDefaultStyle()->getFont();
  $defaultcolwidth = $sheet->getDefaultColumnDimension()->getWidth();
  if ($defaultcolwidth > 0) {
    $sc['attribs']['defaultcolwidth'] = $defaultcolwidth;
  } 
  $defaultrowheight = $sheet->getDefaultRowDimension()->getRowHeight();
  if ($defaultrowheight > 0) {
    $sc['attribs']['defaultrowheight'] = $defaultrowheight;
  }
  $sc['attribs']['lastrow'] = $sheet->getHighestRow();
  $lastColumn = $sheet->getHighestColumn();
  $lastColumnIndex = PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($lastColumn);

  $sc['attribs']['lastcol'] = $lastColumnIndex;
  // Iterate on rows.
  foreach ($rit = $sheet->getRowIterator() as $row) {
    $r = $row->getRowIndex();
    $height = $sheet->getRowDimension($r)->getRowHeight();
    if ($height != -1 && $height != $sc['attribs']['defaultrowheight']) {
      $sc['rowattribs']['height'][$r] = $height;
    }
    if (!$sheet->getRowDimension($r)->getVisible()) {
      $sc['rowattribs']['hide'][$r] = TRUE;
    }

    // Iterate on cells.
    foreach ($cit = $row->getCellIterator() as $cell) {
      $ca = $cell->getColumn();
      $c = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($ca);
      $width = $sheet->getColumnDimension($ca)->getWidth();
      if ($width != -1) {
        $width = PhpOffice\PhpSpreadsheet\Shared\Drawing::cellDimensionToPixels($width, $defaultFont);
        if ($width != $sc['attribs']['defaultcolwidth']) {
          $sc['colattribs']['width'][$c] = $width;
        }
      }
      if (!$sheet->getColumnDimension($ca)->getVisible()) {
        $sc['colattribs']['hide'][$c] = TRUE;
      }
      
      _sheetnode_phpexcel_import_cell($workbook, $sheet, $cell, $sc);
    }
  }

  // Cell merges
  foreach ($sheet->getMergeCells() as $range) {
    list($first, $last) = explode(':', $range);
    if (!isset($sc['cells'][$first])) continue;
    $firstcr = socialcalc_coord_to_cr($first);
    $lastcr = socialcalc_coord_to_cr($last);
    $sc['cells'][$first]['colspan'] = $lastcr[0] - $firstcr[0] + 1;
    $sc['cells'][$first]['rowspan'] = $lastcr[1] - $firstcr[1] + 1;
  }

  // Names
  foreach ($workbook->getNamedRanges() as $range) {
    // TODO: Handle external references and functions.
    $sc['names'][$range->getName()] = array(
      'desc' => '',
      'definition' => $range->getRange(),
    );
  }
  
  // Reset caches.
  _sheetnode_phpexcel_get_cached_styles(TRUE);

  $socialcalc = array(
    'sheet' => $sc,
    'edit' => socialcalc_default_edit($sc),
    'audit' => socialcalc_default_audit($sc),
  );
  return socialcalc_save($socialcalc);
}

function _sheetnode_phpexcel_import_cell($workbook, $sheet, $cell, &$sc) {
  $c = array(); // output cell
  
  // Position
  $c['pos'] = array(PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($cell->getColumn()), $cell->getRow());
  // Value and type
  switch ($cell->getDataType()) {
  case PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_BOOL:
    $c['datavalue'] = (bool)$cell->getValue();
    $c['datatype'] = 'v';
    $c['valuetype'] = 'n';
    break;
  case PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC:
    $c['datavalue'] = floatval($cell->getValue());
    $c['datatype'] = 'v';
    $c['valuetype'] = 'n';
    break;
  case PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING:
    $text = $cell->getValue();
    if ($text instanceof PHPExcel_RichText) {
      $style = $sheet->getStyle($cell->getCoordinate());
      $defaultfont = $style->getFont();
      foreach ($text->getRichTextElements() as $element) {
        $font = $element instanceof PHPExcel_RichText_Run ? $element->getFont() : $defaultfont;
        $cellData .= '<span style="' . _sheetnode_phpexcel_assembleCSS(_sheetnode_phpexcel_createCSSStyleFont($font)) . '">';

        if ($font->getSuperScript()) {
          $cellData .= '<sup>';
        } else if ($font->getSubScript()) {
          $cellData .= '<sub>';
        }

        // Convert UTF8 data to PCDATA
        $cellText = $element->getText();
        $cellData .= htmlspecialchars($cellText);

        if ($font->getSuperScript()) {
          $cellData .= '</sup>';
        } else if ($font->getSubScript()) {
          $cellData .= '</sub>';
        }

        $cellData .= '</span>';
      }
      $c['datavalue'] = $cellData;
      $c['valuetype'] = 'th';
    }
    else { // it is plain text
      $c['datavalue'] = $text;
      $c['valuetype'] = 't';
    }
    $c['datatype'] = 't';
    break;
  case PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA:
    $c['datatype'] = 'f';
    $c['formula'] = ltrim($cell->getValue(), '=');
    try {
      //$c['datavalue'] = $cell->getCalculatedValue();
      $c['datavalue'] = 0;
    }
    catch (Exception $e) {
      $c['datavalue'] = 0;
      //watchdog('sheetnode_phpexcel', 'Error importing formula "!formula" at cell !coord.', array('!formula' => $c['formula'], '!coord' => $cell->getCoordinate()), 'warning');
    }
    $c['valuetype'] = is_numeric($c['datavalue']) ? 'n' : 't';
    break;
  case PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_ERROR:
    $c['errors'] = $cell->getValue();
    break;
  case PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NULL:
    break;
  }

  // Comment
  $comment = $sheet->getComment($cell->getCoordinate());
  if (!empty($comment)) {
    $c['comment'] = $comment->getText()->getPlainText();
  }

  // Style
  $style = $sheet->getStyle($cell->getCoordinate());
  $styles = _sheetnode_phpexcel_get_cached_styles();
  $hash = $style->getHashCode();
  if (empty($styles[$hash])) {
    // Font
    $font = _sheetnode_phpexcel_get_font($style->getFont());
    if ($font) {
      $styles[$hash]['font'] = _sheetnode_phpexcel_insert_hash($sc, 'font', $font);
    }

    // Color
    $color = _sheetnode_phpexcel_get_color($style->getFont()->getColor());
    if ($color) {
      $styles[$hash]['color'] = _sheetnode_phpexcel_insert_hash($sc, 'color', $color);
    }

    // Background color
    $bgcolor = _sheetnode_phpexcel_get_color($style->getFill()->getStartColor());
    if ($bgcolor) {
      $styles[$hash]['bgcolor'] = _sheetnode_phpexcel_insert_hash($sc, 'color', $bgcolor);
    }

    // Borders
    $borders = array(
      'bt' => 'getTop',
      'bl' => 'getLeft',
      'bb' => 'getBottom',
      'br' => 'getRight',
    );
    foreach ($borders as $bi => $method) {
      $border = _sheetnode_phpexcel_get_border($style->getBorders()->$method());
      if ($border) {
        $styles[$hash][$bi] = _sheetnode_phpexcel_insert_hash($sc, 'borderstyle', $border);
      }
    }

    // Cell format (horizontal alignment)
    $cellformat = _sheetnode_phpexcel_get_cellformat($style);
    if ($cellformat) {
      $styles[$hash]['cellformat'] = _sheetnode_phpexcel_insert_hash($sc, 'cellformat', $cellformat);
    }

    // Layout (padding + vertical alignment)
    $layout = _sheetnode_phpexcel_get_layout($style);
    if ($layout) {
      $styles[$hash]['layout'] = _sheetnode_phpexcel_insert_hash($sc, 'layout', $layout);
    }

    // Number format
    $ntvf = _sheetnode_phpexcel_get_valueformat($style->getNumberFormat());
    if ($ntvf) {
      $styles[$hash]['nontextvalueformat'] = _sheetnode_phpexcel_insert_hash($sc, 'valueformat', $ntvf);
    }
  }
  $c += $styles[$hash]; // merge the cached styles into the cell directly.

  $sc['cells'][$cell->getCoordinate()] = $c;
}

function _sheetnode_phpexcel_get_cached_styles($reset = FALSE) {
  static $styles = array();
  if ($reset) {
    $styles = array();
  }
  return $styles;
}

/**
 * LIFTED FROM PHPExcel/Classes/PHPExcel/Writer/HTML.php
 * Takes array where of CSS properties / values and converts to CSS string
 *
 * @param array
 * @return string
 */
function _sheetnode_phpexcel_assembleCSS($pValue = array())
{
  $pairs = array();
  foreach ($pValue as $property => $value) {
    $pairs[] = $property . ':' . $value;
  }
  $string = implode('; ', $pairs);

  return $string;
}

/**
 * LIFTED FROM PHPExcel/Classes/PHPExcel/Writer/HTML.php
 * Create CSS style (PHPExcel_Style_Font)
 *
 * @param PHPExcel_Style_Font     $pStyle     PHPExcel_Style_Font
 * @return  array
 */
function _sheetnode_phpexcel_createCSSStyleFont(PHPExcel_Style_Font $pStyle) {
  // Construct CSS
  $css = array();

  // Create CSS
  if ($pStyle->getBold()) {
    $css['font-weight'] = 'bold';
  }
  if ($pStyle->getUnderline() != PHPExcel_Style_Font::UNDERLINE_NONE && $pStyle->getStrikethrough()) {
    $css['text-decoration'] = 'underline line-through';
  } else if ($pStyle->getUnderline() != PHPExcel_Style_Font::UNDERLINE_NONE) {
    $css['text-decoration'] = 'underline';
  } else if ($pStyle->getStrikethrough()) {
    $css['text-decoration'] = 'line-through';
  }
  if ($pStyle->getItalic()) {
    $css['font-style'] = 'italic';
  }

  $css['color']   = '#' . $pStyle->getColor()->getRGB();
  $css['font-family'] = '\'' . $pStyle->getName() . '\'';
  $css['font-size'] = $pStyle->getSize() . 'pt';

  // Return
  return $css;
}

function _sheetnode_phpexcel_insert_hash(&$sc, $key, $style) {
    // Initialize $hash if it's not set or null
    $hash = isset($sc[$key.'hash'][$style]) ? $sc[$key.'hash'][$style] : null;
    
    if (is_null($hash)) {
        // Ensure $sc[$key.'s'] is initialized as an array if it's not set
        if (!isset($sc[$key.'s']) || !is_array($sc[$key.'s'])) {
            $sc[$key.'s'] = [];
        }
        
        // Calculate the new hash value
        $hash = count($sc[$key.'s']) + 1;
        
        // Assign $style to $sc[$key.'s'] using $hash as the index
        $sc[$key.'s'][$hash] = $style;
        
        // Store $hash in $sc[$key.'hash'] for future reference
        $sc[$key.'hash'][$style] = $hash;
    }
    
    return $hash;
}
function _sheetnode_phpexcel_get_font($font) {
  return ($font->getItalic() ? 'italic' : 'normal') .' '.
         ($font->getBold() ? 'bold' : 'normal') .' '.
         ($font->getSize() .'pt') .' '.
         ($font->getName());
}

function _sheetnode_phpexcel_get_border($border) {
  $borderstyles = array(
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_NONE => FALSE,
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN => 'thin solid', 
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUM => 'medium solid', 
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DASHED => 'thin dashed', 
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DOTTED => 'thin dotted', 
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THICK => 'thick solid', 
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DOUBLE => 'thin double', 
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_HAIR => 'thin dotted',  // TODO: is it?
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUMDASHED => 'medium dashed', 
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DASHDOT => 'thin dashed', // TODO: is it?
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUMDASHDOT => 'medium dashed', //TODO: is it?
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DASHDOTDOT => 'thin dashed', // TODO: is it?
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_MEDIUMDASHDOTDOT => 'medium dashed', // TODO: is it?
    PhpOffice\PhpSpreadsheet\Style\Border::BORDER_SLANTDASHDOT => 'thin dashed', // TODO: is it?
  );
  $borderstyle = $borderstyles[$border->getBorderStyle()];
  if (!$borderstyle) return FALSE;
  $bordercolor = _sheetnode_phpexcel_get_color($border->getColor());
  return $borderstyle .' '. $bordercolor;
}

function _sheetnode_phpexcel_get_cellformat($style) {
  $cellformats = array(
    PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_GENERAL => FALSE,
    PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT => 'left',
    PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER => 'center',
    PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_RIGHT => 'right',
    PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_JUSTIFY => 'justify',
    PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER_CONTINUOUS => 'center', // TODO: is it?
  );
  return $cellformats[$style->getAlignment()->getHorizontal()];
}

function _sheetnode_phpexcel_get_layout($style) {
  $valignments = array(
    PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_TOP => 'top',
    PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER => 'middle',
    PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_BOTTOM => 'bottom', 
    PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_JUSTIFY => 'middle', // TODO: is it?
  );
  $valignment = $valignments[$style->getAlignment()->getVertical()];
  $padding_left = $style->getAlignment()->getIndent();
  $padding_left = empty($padding_left) ? '*' : PHPExcel_Shared_Drawing::pointsToPixels($padding_left) . 'px';
  return 'padding:* * * '. $padding_left .';vertical-align:'. $valignment .';';
}

function _sheetnode_phpexcel_get_valueformat($numberformat) {
  $valueformat = $numberformat->getFormatCode();
  if (strtolower($valueformat) == 'general') return FALSE;
  $valueformat = str_replace(';@', '', $valueformat);
  return $valueformat;
}

function _sheetnode_phpexcel_get_color($color) {
  $rgb = $color->getRGB();
  return 'rgb(' . hexdec(substr($rgb, 0, 2)) .','. hexdec(substr($rgb, 2, 2)) .','. hexdec(substr($rgb, 4, 2)) .')';
}

