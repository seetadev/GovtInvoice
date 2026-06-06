// TypeScript declarations for SocialCalc library

declare global {
  interface Window {
    SocialCalc: typeof SocialCalc;
    hs: HighslideConfig;
    jQuery: JQueryStatic;
    $: JQueryStatic;
  }
}

interface HighslideConfig {
  graphicsDir: string;
  outlineType: string;
  showCredits: boolean;
  wrapperClassName: string;
}

interface JQueryStatic {
  (selector: string | Element | Document): any;
  ajax: any;
  [key: string]: any;
}

declare namespace SocialCalc {
  // Constants
  const Constants: {
    defaultImagePrefix: string;
    doWorkBook: boolean;
    SCToolbarbackground: string;
    SCTabbackground: string;
    SCTabselectedCSS: string;
    SCTabplainCSS: string;
    SCToolbartext: string;
    SCFormulabarheight: number;
    SCSheetBarHeight: number;
    SCSheetBarCSS: string;
    SCStatuslineheight: number;
    SCStatuslineCSS: string;
    [key: string]: any;
  };

  // Callbacks
  const Callbacks: {
    broadcast: (action: string, data: any) => void;
    editAutoSave?: () => void;
    [key: string]: any;
  };

  // Current active object (singleton)
  let CurrentSpreadsheetControlObject: SpreadsheetControl | null;

  // Core Classes
  class Sheet {
    sheetid: string;
    sheetname: string;
    cells: Record<string, Cell>;
    attribs: SheetAttributes;
    statuscallback: ((sheet: Sheet, status: string, arg: any, params: any) => void) | null;
    statuscallbackparams: any;

    constructor();
    ParseSheetSave(data: string): void;
    CreateSheetSave(): string;
    ResetSheet(): void;
    RecalcSheet(callback?: () => void, params?: any): void;
    ScheduleSheetCommands(cmd: string, saveundo: boolean, isremote?: boolean): void;
    EncodeCellAttributes(coord: string): Record<string, any>;
    EncodeSheetAttributes(): Record<string, any>;
  }

  class Cell {
    coord: string;
    datavalue: string | number;
    datatype: 'v' | 't' | 'f' | 'c' | null;
    formula: string;
    valuetype: string;
    displayvalue?: string;
    readonly?: boolean;
    comment?: string;
    [key: string]: any;
  }

  interface SheetAttributes {
    needsrecalc?: string;
    [key: string]: any;
  }

  class RenderContext {
    constructor(sheet: Sheet);
    showGrid: boolean;
    showRCHeaders: boolean;
    highlights: Record<string, string>;
    cursorsuffix: string;
    [key: string]: any;
  }

  class TableEditor {
    constructor(context: RenderContext);
    context: RenderContext;
    ecell: ECell | null;
    range: Range;
    range2: Range;
    state: string;
    inputBox: HTMLInputElement | null;
    workingvalues: Record<string, any>;

    FitToEditTable(): void;
    ScheduleRender(): void;
    EditorScheduleSheetCommands(cmd: string, saveUndo: boolean, broadcast: boolean): void;
    StatusCallback: Record<string, StatusCallbackEntry>;
    MoveECellCallback: Record<string, (editor: TableEditor) => void>;
    RangeChangeCallback: Record<string, () => void>;
    SettingsCallbacks: Record<string, any>;
  }

  interface ECell {
    coord: string;
    row: number;
    col: number;
  }

  interface Range {
    hasrange: boolean;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  }

  interface StatusCallbackEntry {
    func: (editor: TableEditor, status: string, arg: any, params: any) => void;
    params: any;
  }

  class SpreadsheetControl {
    constructor();

    // Properties
    parentNode: HTMLElement | null;
    spreadsheetDiv: HTMLElement | null;
    requestedHeight: number;
    requestedWidth: number;
    requestedSpaceBelow: number;
    height: number;
    width: number;
    viewheight: number;
    sheet: Sheet;
    context: RenderContext;
    editor: TableEditor;
    tabs: Tab[];
    tabnums: Record<string, number>;
    tabreplacements: Record<string, any>;
    currentTab: number;
    views: Record<string, View>;
    idPrefix: string;
    imagePrefix: string;
    multipartBoundary: string;
    toolbarbackground: string;
    tabbackground: string;
    tabselectedCSS: string;
    tabplainCSS: string;
    toolbartext: string;
    formulabarheight: number;
    sheetbarheight: number;
    sheetbarCSS: string;
    statuslineheight: number;
    statuslineCSS: string;
    ExportCallback: ((ctrl: SpreadsheetControl) => void) | null;
    sortrange: string;
    moverange: string;
    editorDiv: HTMLElement | null;
    formulabuttons: Record<string, FormulaButton>;

    // Methods
    InitializeSpreadsheetControl(
      node: string | HTMLElement,
      height?: number,
      width?: number,
      spacebelow?: number
    ): void;
    DoOnResize(): void;
    SizeSSDiv(): void;
    ExecuteCommand(cmd: string, params: string): void;
    CreateSheetHTML(): string;
    CreateSpreadsheetSave(otherparts?: any): string;
    DecodeSpreadsheetSave(str: string): void;
    ParseSheetSave(str: string): void;
    CreateSheetSave(): string;
  }

  interface Tab {
    name: string;
    text: string;
    html: string;
    view?: string;
    oncreate?: (spreadsheet: SpreadsheetControl, tabname: string) => void;
    onclick?: (spreadsheet: SpreadsheetControl, tabname: string) => void;
    onclickFocus?: string | boolean;
    onunclick?: (spreadsheet: SpreadsheetControl, tabname: string) => void;
  }

  interface View {
    name: string;
    element: HTMLElement | null;
    replacements: Record<string, any>;
    html: string;
    divStyle?: string;
    oncreate?: (spreadsheet: SpreadsheetControl, view: View) => void;
    needsresize?: boolean;
    onresize?: (spreadsheet: SpreadsheetControl, view: View) => void;
    values?: Record<string, any>;
  }

  interface FormulaButton {
    image: string;
    tooltip: string;
    command: (spreadsheet: SpreadsheetControl) => void;
  }

  class WorkBook {
    constructor(spreadsheet: SpreadsheetControl);

    spreadsheet: SpreadsheetControl;
    defaultsheetname: string | null;
    sheetArr: Record<string, WorkBookSheet>;
    clipsheet: ClipSheet;

    InitializeWorkBook(defaultsheet: string): void;
    AddNewWorkBookSheet(
      sheetname: string,
      oldsheetname?: string | null,
      fromclip?: boolean,
      spread?: Sheet | null
    ): void;
    AddNewWorkBookSheetNoSwitch(
      sheetid: string,
      sheetname: string,
      savestr?: string
    ): void;
    ActivateWorkBookSheet(sheetname: string, oldsheetname?: string): void;
    DeleteWorkBookSheet(sheetname: string, cursheetname: string): void;
    SaveWorkBookSheet(sheetid: string): { savestr: string };
    LoadRenameWorkBookSheet(
      sheetid: string,
      savestr: string,
      newname: string
    ): void;
    RenameWorkBookSheet(
      oldname: string,
      newname: string,
      sheetid: string
    ): void;
    CopyWorkBookSheet(sheetid: string): void;
    PasteWorkBookSheet(newid: string, oldid: string): void;
    RenderWorkBookSheet(): void;
    SheetNameExistsInWorkBook(name: string): boolean;
    WorkbookScheduleCommand(cmd: any, isremote: boolean): void;
    WorkbookScheduleSheetCommand(cmd: any, isremote: boolean): void;
  }

  interface WorkBookSheet {
    sheet: Sheet;
    context: RenderContext | null;
    editorprop: {
      ecell: ECell | null;
      range: Range | null;
      range2: Range | null;
    };
  }

  interface ClipSheet {
    savestr: string | null;
    copiedfrom: string | null;
    editorprop: Record<string, any>;
  }

  class WorkBookControl {
    constructor(book: WorkBook, divid: string, defaultsheetname: string);

    workbook: WorkBook;
    div: string;
    sheetButtonArr: Record<string, HTMLElement>;
    numSheets: number;
    currentSheetButton: HTMLElement | null;

    InitializeWorkBookControl(): void;
    ExecuteWorkBookControlCommand(cmd: any, isremote: boolean): void;
  }

  // Utility functions
  function GetSpreadsheetControlObject(): SpreadsheetControl;
  function GetCurrentWorkBookControl(): WorkBookControl;
  function CmdGotFocus(element: HTMLElement | boolean): void;
  function KeyboardFocus(): void;
  function DoCmd(element: any, cmd: string): void;
  function SetTab(element: HTMLElement): void;
  function LocalizeString(str: string): string;
  function LocalizeSubstring(str: string): string;
  function setStyles(element: HTMLElement, styles: string): void;
  function EditorSheetStatusCallback(
    sheet: Sheet,
    status: string,
    arg: any,
    params: any
  ): void;
  function SpreadsheetControlStatuslineCallback(
    editor: TableEditor,
    status: string,
    arg: any,
    params: any
  ): void;

  // Formula namespace
  namespace Formula {
    const SheetCache: {
      sheets: Record<string, { sheet: Sheet; name: string }>;
    };
    function LookupName(
      sheet: Sheet,
      name: string
    ): { type: string; value: string };
    function ParseFormulaIntoTokens(formula: string): any[];
  }

  // SpreadsheetControl static methods
  namespace SpreadsheetControl {
    function DoFunctionList(spreadsheet: SpreadsheetControl): void;
    function DoMultiline(spreadsheet: SpreadsheetControl): void;
    function DoLink(spreadsheet: SpreadsheetControl): void;
    function DoSum(spreadsheet: SpreadsheetControl): void;
  }
}

export {};
