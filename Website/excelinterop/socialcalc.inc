<?php

/**
 * @file SocialCalc manipulation functions
 * Translated from socialcalc-3.js and companion files
 */

define('SOCIALCALC_MULTIPART_BOUNDARY', 'SocialCalcSpreadsheetControlSave');

class SocialCalc_Constants {
  public static $defaultFormatp = '#,##0.0%';
  public static $defaultFormatc = '[$$]#,##0.00';
  public static $defaultFormatdt = 'd-mmm-yyyy h:mm:ss';
  public static $defaultFormatd = 'd-mmm-yyyy';
  public static $defaultFormatt = '[h]:mm:ss';
  public static $defaultDisplayTRUE = 'TRUE';
  public static $defaultDisplayFALSE = 'FALSE';
}

function socialcalc_parse($data) {
  $parts = socialcalc_parse_parts($data);
  foreach ($parts as $name => $part) {
    $sc[$name] = call_user_func('socialcalc_parse_'. $name, $part);
  }
  return $sc;
}

function socialcalc_parse_parts($data) {
  // Parse the MIME header.
  $matches = array();
  if (!preg_match('/^MIME-Version:\s1\.0/mi', $data, $matches)) return array();
 
  $matches = array();
  if (!preg_match('/^Content-Type:\s*multipart\/mixed;\s*boundary=(\S+)/mi', $data, $matches)) return array();
  
  $boundary = $matches[1];
  $matches = array();
  $count = preg_match_all("/^(--". $boundary ."(?:\r\n|\n|--))/m", $data, $matches, PREG_OFFSET_CAPTURE | PREG_PATTERN_ORDER);
  if ($count === FALSE || $count < 2) return array();

  // Parse the SocialCalc parts.
  for ($i=0; $i<$count; $i++) {
    if ($i == $count-1) continue;
    $start = $matches[0][$i][1] + strlen($matches[1][$i][0]);
    $end = $matches[0][$i+1][1];
    $part = substr($data, $start, $end - $start);
    $skip = array();
    preg_match("/^Content-Type:(?:.*?)(?:\r\n|\n)(?:\r\n|\n)/mi", $part, $skip);
    $part = substr($part, strlen($skip[0]));
    if ($i == 0) { // Sheet header
      $j = 1;
      $line = strtok($part, "\n");
      while ($line !== FALSE) {
        $line = rtrim($line);
        $names = explode(':', $line);
        if (isset($names)) switch ($names[0]) {
        case 'version':
          break;
        case 'part':
          $partnames[$j++] = $names[1];
          break;
        }
        $line = strtok("\n");
      }
    }
    else { // Sheet parts
      $parts[$partnames[$i]] = $part;
    }
  }
  return $parts;
}

function socialcalc_parse_edit($data) {
  $edit = array(
    'rowpanes' => array(0 => array('first' => 1, 'last' => 1)),
    'colpanes' => array(0 => array('first' => 1, 'last' => 1)),
    'range' => array('hasrange' => FALSE),
  );
  $line = strtok($data, "\n");
  while ($line !== FALSE) {
    $line = rtrim($line);
    $parts = explode(':', $line);
    switch ($parts[0]) {
    case "version":
      break;

    case "rowpane":
      $edit['rowpanes'][$parts[1]-0] = array('first' => $parts[2]-0, 'last' => $parts[3]-0);
      break;

    case "colpane":
      $edit['colpanes'][$parts[1]-0] = array('first' => $parts[2]-0, 'last' => $parts[3]-0);
      break;

    case "ecell":
      $edit['ecell']['pos'] = socialcalc_coord_to_cr($parts[1]);
      $edit['ecell']['coord'] = $parts[1];
      $edit['highlights'][$parts[1]] = "cursor";
      break;

    case "range":
      $range['hasrange'] = TRUE;
      $range['anchorcoord'] = $parts[1];
      $range['anchorpos'] = socialcalc_coord_to_cr($parts[1]);
      $range['top'] = $parts[2]-0;
      $range['bottom'] = $parts[3]-0;
      $range['left'] = $parts[4]-0;
      $range['right'] = $parts[5]-0;
      for ($row=$range['top']; $row<=$range['bottom']; $row++) {
        for ($col=$range['left']; $col<=$range['right']; $col++) {
          $coord = socialcalc_cr_to_coord($col, $row);
          if (@$edit['highlights'][$coord] != "cursor") {
            $edit['highlights'][$coord] = "range";
          }
        }
      }
      $edit['range'] = $range;
      break;

    default:
      $key = array_shift($parts);
      $edit[$key] = $parts;
      break;
    }
    $line = strtok("\n");
  }
  return $edit;
}

function socialcalc_parse_audit($data) {
  return array();
}
         
function socialcalc_parse_sheet($data) {
  $line = strtok($data, "\n");
  $sheet = array();
  while ($line !== FALSE) {
    $line = rtrim($line);
    $parts = explode(':', $line);
    switch ($parts[0]) {
    case 'cell':
      $coord = $parts[1];
      $cell = isset($sheet['cells'][$coord]) ? $sheet['cells'][$coord] : array('pos' => socialcalc_coord_to_cr($coord));
      $cell += socialcalc_parse_cell($parts, 2);
      $sheet['cells'][$coord] = $cell;
      break;

    case "col":
      $coord = $parts[1];
      $pos = socialcalc_coord_to_cr($coord .'1'); // convert to col number
      $j = 2;
      while ($t = @$parts[$j++]) {
        switch ($t) {
        case "w":
          $sheet['colattribs']['width'][$pos[0]] = strval($parts[$j++]); // must be text - could be auto or %, etc.
          break;
        case "hide":
          $sheet['colattribs']['hide'][$pos[0]] = $parts[$j++];
          break;
        }
      }
      break;

    case "row":
      $coord = intval($parts[1]);
      $j = 2;
      while ($t = @$parts[$j++]) {
        switch ($t) {
        case "h":
          $sheet['rowattribs']['height'][$coord] = intval($parts[$j++]);
          break;
        case "hide":
          $sheet['rowattribs']['hide'][$coord] = $parts[$j++];
          break;
        }
      }
      break;

    case "sheet":
      $j = 1;
      while ($t = @$parts[$j++]) {
        switch ($t) {
        case "c":
          $sheet['attribs']['lastcol'] = intval($parts[$j++]);
          break;
        case "r":
          $sheet['attribs']['lastrow'] = intval($parts[$j++]);
          break;
        case "w":
          $sheet['attribs']['defaultcolwidth'] = intval($parts[$j++]);
          break;
        case "h":
          $sheet['attribs']['defaultrowheight'] = intval($parts[$j++]);
          break;
        case "tf":
          $sheet['attribs']['defaulttextformat'] = intval($parts[$j++]);
          break;
        case "ntf":
          $sheet['attribs']['defaultnontextformat'] = intval($parts[$j++]);
          break;
        case "layout":
          $sheet['attribs']['defaultlayout'] = intval($parts[$j++]);
          break;
        case "font":
          $sheet['attribs']['defaultfont'] = intval($parts[$j++]);
          break;
        case "tvf":
          $sheet['attribs']['defaulttextvalueformat'] = intval($parts[$j++]);
          break;
        case "ntvf":
          $sheet['attribs']['defaultnontextvalueformat'] = intval($parts[$j++]);
          break;
        case "color":
          $sheet['attribs']['defaultcolor'] = intval($parts[$j++]);
          break;
        case "bgcolor":
          $sheet['attribs']['defaultbgcolor'] = intval($parts[$j++]);
          break;
        case "circularreferencecell":
          $sheet['attribs']['circularreferencecell'] = $parts[$j++];
          break;
        case "recalc":
          $sheet['attribs']['recalc'] = $parts[$j++];
          break;
        case "needsrecalc":
          $sheet['attribs']['needsrecalc'] = $parts[$j++];
          break;
        case "usermaxcol":
          $sheet['attribs']['usermaxcol'] = intval($parts[$j++]);
          break;
        case "usermaxrow":
          $sheet['attribs']['usermaxrow'] = intval($parts[$j++]);
          break;
        default:
          $j += 1;
          break;
        }
      }
    break;

    case "name":
      $name = strtoupper(socialcalc_decode_value($parts[1]));
      $sheet['names'][$name] = array('desc' => socialcalc_decode_value($parts[2]),
                                     'definition' => socialcalc_decode_value($parts[3]));
      break;

    case "layout":
      $parts = array();
      preg_match('/^layout\:(\d+)\:(.+)$/', $line, $parts); // layouts can have ":" in them
      $sheet['layouts'][intval($parts[1])] = $parts[2];
      $sheet['layouthash'][$parts[2]] = intval($parts[1]);
      break;

    case "font":
      $sheet['fonts'][intval($parts[1])] = $parts[2];
      $sheet['fonthash'][$parts[2]] = intval($parts[1]);
      break;

    case "color":
      $sheet['colors'][intval($parts[1])] = $parts[2];
      $sheet['colorhash'][$parts[2]] = intval($parts[1]);
      break;

    case "border":
      $sheet['borderstyles'][intval($parts[1])] = $parts[2];
      $sheet['borderstylehash'][$parts[2]] = intval($parts[1]);
      break;

    case "cellformat":
      $sheet['cellformats'][intval($parts[1])] = $parts[2];
      $sheet['cellformathash'][$parts[2]] = intval($parts[1]);
      break;

    case "valueformat":
      $v = socialcalc_decode_value($parts[2]);
      $sheet['valueformats'][intval($parts[1])] = $v;
      $sheet['valueformathash'][$v] = intval($parts[1]);
      break;

    case "version":
      break;

    case "copiedfrom":
      $sheet['copiedfrom'] = $parts[1] .':'. $parts[2];
      break;

    case "clipboardrange": // in save versions up to 1.3. Ignored.
    case "clipboard":
      break;

    case "":
      break;

    default:
      break;
    }
    $line = strtok("\n");
  }
  return $sheet;
}

function socialcalc_parse_cell($parts, $j) {
  $cell = array();
  while ($t = @$parts[$j++]) {
    switch ($t) {
    case "v":
      $cell['datavalue'] = doubleval(socialcalc_decode_value($parts[$j++]));
      $cell['datatype'] = "v";
      $cell['valuetype'] = "n";
      break;
    case "t":
      $cell['datavalue'] = strval(socialcalc_decode_value($parts[$j++]));
      $cell['datatype'] = "t";
      $cell['valuetype'] = "t"; 
      break;
    case "vt":
      $v = $parts[$j++];
      $cell['valuetype'] = $v;
      $cell['datatype'] = $v[0]=="n" ? "v" : "t";
      $cell['datavalue'] = socialcalc_decode_value($parts[$j++]);
      break;
    case "vtf":
      $cell['valuetype'] = strval($parts[$j++]);
      $cell['datavalue'] = socialcalc_decode_value($parts[$j++]);
      $cell['formula'] = strval(socialcalc_decode_value($parts[$j++]));
      $cell['datatype'] = "f";
      break;
    case "vtc":
      $cell['valuetype'] = strval($parts[$j++]);
      $cell['datavalue'] = socialcalc_decode_value($parts[$j++]);
      $cell['formula'] = strval(socialcalc_decode_value($parts[$j++]));
      $cell['datatype'] = "c";
      break;
    case "e":
      $cell['errors'] = strval(socialcalc_decode_value($parts[$j++]));
      break;
    case "b":
      $cell['bt'] = intval($parts[$j++]);
      $cell['br'] = intval($parts[$j++]);
      $cell['bb'] = intval($parts[$j++]);
      $cell['bl'] = intval($parts[$j++]);
      break;
    case "l":
      $cell['layout'] = intval($parts[$j++]);
      break;
    case "f":
      $cell['font'] = intval($parts[$j++]);
      break;
    case "c":
      $cell['color'] = intval($parts[$j++]);
      break;
    case "bg":
      $cell['bgcolor'] = intval($parts[$j++]);
      break;
    case "cf":
      $cell['cellformat'] = intval($parts[$j++]);
      break;
    case "ntvf":
      $cell['nontextvalueformat'] = intval($parts[$j++]);
      break;
    case "tvf":
      $cell['textvalueformat'] = intval($parts[$j++]);
      break;
    case "colspan":
      $cell['colspan'] = intval($parts[$j++]);
      break;
    case "rowspan":
      $cell['rowspan'] = intval($parts[$j++]);
      break;
    case "cssc":
      $cell['cssc'] = strval($parts[$j++]);
      break;
    case "csss":
      $cell['csss'] = strval(socialcalc_decode_value($parts[$j++]));
      break;
    case "mod":
      $j+=1;
      break;
    case "comment":
      $cell['comment'] = strval(socialcalc_decode_value($parts[$j++]));
      break;
    case "ro":
      $cell['readonly'] = strcmp(strtolower(strval(socialcalc_decode_value($parts[$j++]))), "yes") == 0;
      break;
    }
  }
  return $cell;
}

function socialcalc_parse_values($data) {
  $line = strtok($data, "\n");
  $sheet = array();
  while ($line !== FALSE) {
    $line = rtrim($line);
    $parts = explode(':', $line);
    if ($parts[0] == 'cell') {
      $coord = $parts[1];
      $cell = isset($sheet['cells'][$coord]) ? $sheet['cells'][$coord] : array();
      $cell += socialcalc_parse_cell_value($parts, 2);
      $sheet['cells'][$coord] = $cell;
    }
    $line = strtok("\n");
  }
  return $sheet;
}

function socialcalc_parse_cell_value($parts, $j) {
  $cell = array();
  while ($t = @$parts[$j++]) {
    switch ($t) {
    case "v":
      $cell['datavalue'] = doubleval(socialcalc_decode_value($parts[$j++]));
      break 2; // first time for me :-)
    case "t":
      $cell['datavalue'] = strval(socialcalc_decode_value($parts[$j++]));
      break 2;
    case "vt":
      $j++;
      $cell['datavalue'] = socialcalc_decode_value($parts[$j++]);
      break 2;
    case "vtf":
      $j++;
      $cell['datavalue'] = socialcalc_decode_value($parts[$j++]);
      break 2;
    case "vtc":
      $j++;
      $cell['datavalue'] = socialcalc_decode_value($parts[$j++]);
      break 2;
    }
  }
  return $cell;
}

function socialcalc_save($sc) {
  $result = "socialcalc:version:1.0\n" .
            "MIME-Version: 1.0\nContent-Type: multipart/mixed; boundary=" . SOCIALCALC_MULTIPART_BOUNDARY . "\n" .
            "--" . SOCIALCALC_MULTIPART_BOUNDARY . "\nContent-type: text/plain; charset=UTF-8\n\n" .
            "# SocialCalc Spreadsheet Control Save\nversion:1.0\npart:sheet\npart:edit\npart:audit\n" .
            "--" . SOCIALCALC_MULTIPART_BOUNDARY . "\nContent-type: text/plain; charset=UTF-8\n\n" .
            socialcalc_save_sheet($sc['sheet']) .
            "--" . SOCIALCALC_MULTIPART_BOUNDARY . "\nContent-type: text/plain; charset=UTF-8\n\n" .
            socialcalc_save_edit($sc['edit']) .
            "--" . SOCIALCALC_MULTIPART_BOUNDARY . "\nContent-type: text/plain; charset=UTF-8\n\n" .
            socialcalc_save_audit($sc['audit']) .
            "--" . SOCIALCALC_MULTIPART_BOUNDARY . "--\n";

  return $result;
}

function socialcalc_save_edit($edit) {
  $result = "version:1.0\n";

  if (!empty($edit['rowpanes'])) foreach ($edit['rowpanes'] as $i => $rowpane) {
    $result .= "rowpane:". $i .":". $rowpane['first'] .":". $rowpane['last'] ."\n";
  }
  if (!empty($edit['colpanes'])) foreach ($edit['colpanes'] as $i => $colpane) {
    $result .= "colpane:". $i .":". $colpane['first'] .":". $colpane['last'] ."\n";
  }

  if (isset($edit['ecell'])) {
    $result .= "ecell:". $edit['ecell']['coord'] ."\n";
  }

  if (!empty($edit['range']['hasrange'])) {
    $result .= "range:". $edit['range']['anchorcoord'] .":". $edit['range']['top'] .":". $edit['range']['bottom'] .":". $edit['range']['left'] .":". $edit['range']['right'] ."\n";
  }

  return $result;
}

function socialcalc_default_edit($sheet) {
  return array(
    'rowpanes' => array('first' => 1, 'last' => isset($sheet['attribs']['lastrow']) ? $sheet['attribs']['lastrow'] : 1),
    'colpanes' => array('first' => 1, 'last' => isset($sheet['attribs']['lastcol']) ? $sheet['attribs']['lastcol'] : 1),
    'ecell' => array('coord' => 'A1'),
  );
}

function socialcalc_save_audit($audit) {
  return '';
}

function socialcalc_default_audit($sheet) {
  return '';
}

function socialcalc_save_sheet($sheet) {
  $sheetar = array();
  $sheetar[] = 'version:1.5';
  if (!empty($sheet['cells'])) foreach ($sheet['cells'] as $cell) {
    $sheetar[] = socialcalc_save_cell($cell);
  }
  if (isset($sheet['colattribs'])) {
    if (!empty($sheet['colattribs']['width'])) foreach ($sheet['colattribs']['width'] as $col => $width) {
      $coord = socialcalc_cr_to_coord($col, 1);
      $sheetar[] = 'col:'. substr($coord, 0, -1) .':w:'. $width;
    }
    if (!empty($sheet['colattribs']['hide'])) foreach ($sheet['colattribs']['hide'] as $col => $hide) {
      $coord = socialcalc_cr_to_coord($col, 1);
      $sheetar[] = 'col:'. substr($coord, 0, -1) .':hide:'. $hide;
    }
  }
  if (isset($sheet['rowattribs'])) {
    if (!empty($sheet['rowattribs']['height'])) foreach ($sheet['rowattribs']['height'] as $row => $height) {
      $sheetar[] = 'row:'. $row .':h:'. $height;
    }
    if (!empty($sheet['rowattribs']['hide'])) foreach ($sheet['rowattribs']['hide'] as $row => $hide) {
      $sheetar[] = 'row:'. $row .':hide:'. $hide;
    }
  }
  if (!empty($sheet['fonts'])) foreach ($sheet['fonts'] as $fid => $font) {
    $sheetar[] = 'font:'. $fid .':'. $font;
  }
  if (!empty($sheet['borderstyles'])) foreach ($sheet['borderstyles'] as $bsid => $borderstyle) {
    $sheetar[] = 'border:'. $bsid .':'. $borderstyle;
  }
  if (!empty($sheet['cellformats'])) foreach ($sheet['cellformats'] as $cfid => $cellformat) {
    $sheetar[] = 'cellformat:'. $cfid .':'. socialcalc_encode_value($cellformat);
  }
  if (!empty($sheet['layouts'])) foreach ($sheet['layouts'] as $lid => $layout) {
    $sheetar[] = 'layout:'. $lid .':'. $layout;
  }
//  if (!empty($sheet['colors'])) foreach ($sheet['colors'] as $cid => $color) {
//    $sheetar[] = 'color:'. $cid .':'. $color;
//  }
  if (!empty($sheet['valueformats'])) foreach ($sheet['valueformats'] as $vfid => $valueformat) {
    $sheetar[] = 'valueformat:'. $vfid .':'. socialcalc_encode_value($valueformat);
  }
  if (!empty($sheet['names'])) foreach ($sheet['names'] as $name => $nameinfo) {
    $sheetar[] = 'name:'. socialcalc_encode_value($name) .':'. socialcalc_encode_value($nameinfo['desc']) .':'. socialcalc_encode_value($nameinfo['definition']);
  }

  $sheetfields = array(
    'lastcol' => 'c', 
    'lastrow' => 'r', 
    'defaultcolwidth' => 'w', 
    'defaultrowheight' => 'h',
    'defaulttextformat' => 'tf', 
    'defaultnontextformat' => 'ntf', 
    'defaulttextvalueformat' => 'tvf', 
    'defaultnontextvalueformat' => 'ntvf',
    'defaultlayout' => 'layout', 
    'defaultfont' => 'font', 
    'defaultcolor' => 'color', 
    'defaultbgcolor' => 'bgcolor',
    'circularreferencecell' => 'circularreferencecell', 
    'recalc' => 'recalc', 
    'needsrecalc' => 'needsrecalc',
    'usermaxcol' => 'usermaxcol',
    'usermaxrow' => 'usermaxrow',
  );
  $sheetattribs = array();
  foreach ($sheetfields as $key => $attrib) {
    if (isset($sheet['attribs'][$key])) {
      $sheetattribs[] = $attrib .':'. $sheet['attribs'][$key];
    }
  }
  if ($sheetattribs) {
    $sheetar[] = 'sheet:'. implode(':', $sheetattribs);
  }

return implode("\n", (array) $sheetar) . "\n";}

function socialcalc_save_cell($cell) {
  $line = 'cell:'. socialcalc_cr_to_coord($cell['pos'][0], $cell['pos'][1]);
  if (isset($cell['datavalue'])) {
    $value = socialcalc_encode_value($cell['datavalue']);
    if ($cell['datatype']=='v') {
      if ($cell['valuetype']=='n') $line .= ':v:'. $value;
      else $line .= ':vt:'. $cell['valuetype'] .':' .$value;
    }
    else if ($cell['datatype']=='t') {
      if ($cell['valuetype']=='t') $line .= ':t:'. $value;
      else $line .= ':vt:'. $cell['valuetype'] .':' .$value;
    }
    else if (isset($cell['formula'])) {
      $formula = socialcalc_encode_value($cell['formula']);
      if ($cell['datatype']=='f')
        $line .= ':vtf:'. $cell['valuetype'] .':'. $value .':'. $formula;
      else if ($cell['datatype']=='c')
        $line .= ':vtc:'. $cell['valuetype'] .':'. $value .':'. $formula;
    }
  }
  if (isset($cell['errors'])) {
    $line .= ':e:'. socialcalc_encode_value($cell['errors']);
  }
  if (!empty($cell['readonly'])) {
    $line .= ':ro:yes';
  }
  $t = @$cell['bt'];
  $r = @$cell['br'];
  $b = @$cell['bb'];
  $l = @$cell['bl'];
  if ($t || $r || $b || $l)
    $line .= ':b:'. $t .':'. $r .':'. $b .':'. $l;
  if (isset($cell['layout'])) $line .= ':l:'. $cell['layout'];
  if (isset($cell['font'])) $line .= ':f:'. $cell['font'];
  if (isset($cell['color'])) $line .= ':c:'. $cell['color'];
  if (isset($cell['bgcolor'])) $line .= ':bg:'. $cell['bgcolor'];
  if (isset($cell['cellformat'])) $line .= ':cf:'. $cell['cellformat'];
  if (isset($cell['textvalueformat'])) $line .= ':tvf:'. $cell['textvalueformat'];
  if (isset($cell['nontextvalueformat'])) $line .= ':ntvf:'. $cell['nontextvalueformat'];
  if (isset($cell['colspan'])) $line .= ':colspan:'. $cell['colspan'];
  if (isset($cell['rowspan'])) $line .= ':rowspan:'. $cell['rowspan'];
  if (isset($cell['cssc'])) $line .= ':cssc:' .$cell['cssc'];
  if (isset($cell['csss'])) $line .= ':csss:' .socialcalc_encode_value($cell['csss']);
  if (isset($cell['mod'])) $line .= ':mod:'. $cell['mod'];
  if (isset($cell['comment'])) $line .= ':comment:'. socialcalc_encode_value($cell['comment']);

  return $line;
}

function socialcalc_encode_value($s) {
  if (!is_string($s)) return $s;
  return str_replace(
    array('\\', ':', "\n"),
    array('\\b', '\\c', '\\n'),
    $s
  );
}

function socialcalc_coord_to_cr($coord) {
  static $coord_to_cr = array();
  if (isset($coord_to_cr[$coord])) return $coord_to_cr[$coord];
  $c=0;$r=0;
  for ($i=0; $i<strlen($coord); $i++) { // this was faster than using regexes; assumes well-formed
    $ch = ord(substr($coord, $i, 1));
    if ($ch==36) ; // skip $'s
    else if ($ch<=57) $r = 10*$r + $ch-48;
    else if ($ch>=97) $c = 26*$c + $ch-96;
    else if ($ch>=65) $c = 26*$c + $ch-64;
  }
  $coord_to_cr[$coord] = array($c, $r);
  return $coord_to_cr[$coord];
}


function socialcalc_cr_to_coord($c, $r, $return_as_array = FALSE) {
  $letters = array( "A","B","C","D","E","F","G","H","I","J","K","L","M",
                    "N","O","P","Q","R","S","T","U","V","W","X","Y","Z" );
  if ($c < 1) $c = 1;
  if ($c > 702) $c = 702; // maximum number of columns - ZZ
  if ($r < 1) $r = 1;
  $collow = ($c - 1) % 26;
  $colhigh = floor(($c - 1) / 26);
  if ($colhigh) {
    $result = array($letters[$colhigh-1] . $letters[$collow], $r);
  }
  else {
    $result = array($letters[$collow], $r);
  }
  return $return_as_array ? $result : $result[0].$result[1];
}

function socialcalc_decode_value($s) {
  if (!is_string($s)) return $s;
  if (strstr($s, '\\') === FALSE) return $s; // for performace reasons: replace nothing takes up time
  $r = str_replace('\\c', ':', $s);
  $r = str_replace('\\n', "\n", $r);
  return str_replace('\\b', '\\', $r);
}

function socialcalc_cellformat_parsefont($cell, $sheet) {
  if (empty($cell['font'])) return FALSE;
  $parts = array();
  preg_match('/^(\*|\S+? \S+?) (\S+?) (\S.*)$/', $sheet['fonts'][$cell['font']], $parts);
  $font = array();
  if ($parts[3] != '*') $font['family'] = $parts[3];
  if ($parts[2] != '*') $font['size'] = $parts[2];
  if ($parts[1] != '*') {
    $font['bold'] = strpos($parts[1], 'bold') !== FALSE;
    $font['italic'] = strpos($parts[1], 'italic') !== FALSE;
  }
  return $font;
}

function socialcalc_cellformat_parsecolor($cell, $sheet, $color) {
  if (empty($cell[$color])) return FALSE;
  $parts = array();
  preg_match('/^rgb\((\d+?),\s*(\d+?),\s*(\d+?)\)\s*$/', $sheet['colors'][$cell[$color]], $parts);
  $rgb = array(
    'r' => intval($parts[1]),
    'g' => intval($parts[2]),
    'b' => intval($parts[3]),
  );
  return $rgb;
}

function socialcalc_cellformat_parselayout($cell, $sheet) {
  if (empty($cell['layout'])) return FALSE;
  $parts = array();
  preg_match('/^padding:\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+);vertical-align:\s*(\S+);$/', $sheet['layouts'][$cell['layout']], $parts);
  $layout = array();
  if ($parts[1] != '*') $layout['padtop'] = str_replace('px', '', $parts[1]);
  if ($parts[2] != '*') $layout['padright'] = str_replace('px', '', $parts[2]);
  if ($parts[3] != '*') $layout['padbottom'] = str_replace('px', '', $parts[3]);
  if ($parts[4] != '*') $layout['padleft'] = str_replace('px', '', $parts[4]);
  if ($parts[5] != '*') $layout['alignvert'] = $parts[5];
  return $layout;
}

function socialcalc_cellformat_parseborder($cell, $sheet, $attrib) {
  if (empty($cell[$attrib])) return FALSE;
  $parts = array();
  preg_match('/^(\S+)\s+(\S+)\s+(\S.+)$/', $sheet['borderstyles'][$cell[$attrib]], $parts);
  $border['thickness'] = $parts[1];
  $border['style'] = $parts[2];
  $color = array();
  preg_match('/^rgb\((\d+?),\s*(\d+?),\s*(\d+?)\)\s*$/', $parts[3], $color);
  $border['color'] = array(
    'r' => intval($color[1]),
    'g' => intval($color[2]),
    'b' => intval($color[3]),
  );
  return $border;
}

// The following functions are found in:
/**
 * PHPExcel
 *
 * Copyright (c) 2006 - 2010 PHPExcel
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 *
 * @category   PHPExcel
 * @package PHPExcel_Shared
 * @copyright  Copyright (c) 2006 - 2010 PHPExcel (http://www.codeplex.com/PHPExcel)
 * @license http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt LGPL
 * @version 1.7.5, 2010-12-10
 */

/**
 * Convert a date from SocialCalc to a Unix timestamp.
 *
 * @param  long  $dateValue   SocialCalc date/time value
 * @return   long         Unix timestamp
 */
function socialcalc_export_date($dateValue = 0) {
  $myBaseDate = 25569;
  //  Adjust for the spurious 29-Feb-1900 (Day 60)
  if ($dateValue < 60) {
    --$myBaseDate;
  }

  // Perform conversion
  if ($dateValue >= 1) {
    $utcDays = $dateValue - $myBaseDate;
    $returnValue = round($utcDays * 24 * 60 * 60);
    if (($returnValue <= PHP_INT_MAX) && ($returnValue >= -PHP_INT_MAX)) {
      $returnValue = (integer) $returnValue;
    }
  } else {
    $hours = round($dateValue * 24);
    $mins = round($dateValue * 24 * 60) - round($hours * 60);
    $secs = round($dateValue * 24 * 60 * 60) - round($hours * 60 * 60) - round($mins * 60);
    $returnValue = (integer) gmmktime($hours, $mins, $secs);
  }

  return $returnValue;
}

/**
 * Convert a date from Excel to a PHP DateTime object
 *
 * @param  long  $dateValue   SocialCalc date/time value
 * @return   long         PHP DateTime object
 */
function socialcalc_export_datetime($dateValue = 0) {
  $dateTime = socialcalc_export_date($dateValue);
  $days = floor($dateTime / 86400);
  $time = round((($dateTime / 86400) - $days) * 86400);
  $hours = round($time / 3600);
  $minutes = round($time / 60) - ($hours * 60);
  $seconds = round($time) - ($hours * 3600) - ($minutes * 60);

  $dateObj = date_create('1-Jan-1970+'.$days.' days');
  $dateObj->setTime($hours,$minutes,$seconds);

  return $dateObj;
}

/**
 * Convert a date from PHP to SocialCalc date/time value
 *
 * @param  mixed    $dateValue  Unix timestamp or PHP DateTime object
 * @return   mixed          SocialCalc date/time value
 *                    or boolean False on failure
 */
function socialcalc_import_date($dateValue = 0) {
  $saveTimeZone = date_default_timezone_get();
  date_default_timezone_set('UTC');
  $retValue = False;
  if ((is_object($dateValue)) && ($dateValue instanceof DateTime)) {
    $retValue = socialcalc_import_date_explicit( $dateValue->format('Y'), $dateValue->format('m'), $dateValue->format('d'),
                         $dateValue->format('H'), $dateValue->format('i'), $dateValue->format('s')
                       );
  } elseif (is_numeric($dateValue)) {
    $retValue = socialcalc_import_date_explicit( date('Y',$dateValue), date('m',$dateValue), date('d',$dateValue),
                         date('H',$dateValue), date('i',$dateValue), date('s',$dateValue)
                       );
  }
  date_default_timezone_set($saveTimeZone);

  return $retValue;
}

/**
 * Convert a date from PHP to SocialCalc date/time value
 *
 * @param long  $year
 * @param long  $month
 * @param long  $day
 * @param long  $hours
 * @param long  $minutes
 * @param long  $seconds
 * @return  long        SocialCalc date/time value
 */
function socialcalc_import_date_explicit($year, $month, $day, $hours=0, $minutes=0, $seconds=0) {
  //
  //  Fudge factor for the erroneous fact that the year 1900 is treated as a Leap Year in MS Excel
  //  This affects every date following 28th February 1900
  //
  $excel1900isLeapYear = True;
  if (($year == 1900) && ($month <= 2)) { $excel1900isLeapYear = False; }
  $myExcelBaseDate = 2415020;

  //  Julian base date Adjustment
  if ($month > 2) {
    $month = $month - 3;
  } else {
    $month = $month + 9;
    --$year;
  }

  //  Calculate the Julian Date, then subtract the Excel base date (JD 2415020 = 31-Dec-1899 Giving Excel Date of 0)
  $century = substr($year,0,2);
  $decade = substr($year,2,2);
  $excelDate = floor((146097 * $century) / 4) + floor((1461 * $decade) / 4) + floor((153 * $month + 2) / 5) + $day + 1721119 - $myExcelBaseDate + $excel1900isLeapYear;

  $excelTime = (($hours * 3600) + ($minutes * 60) + $seconds) / 86400;

  return (float) $excelDate + $excelTime;
}

