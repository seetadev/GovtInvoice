import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonToolbar,
  IonButtons,
  IonToast,
  IonAlert,
  IonLabel,
  IonModal,
  IonSegment,
  IonSegmentButton,
  isPlatform,
} from "@ionic/react";
import React, { useEffect, useState, useRef } from "react";
import * as AppGeneral from "../components/InvoicePage/socialcalc/index.js";
import { File } from "../components/Storage/LocalStorage";
import {
  closeOutline,
  downloadOutline,
  arrowBack,
  documentText,
  folder,
  add,
  cloudOutline,
} from "ionicons/icons";
import { IpfsCloudModal } from "../components/IpfsCloudModal";
import "./InvoicePage.css";
import FileOptions from "../components/InvoicePage/FileMenu/FileOptions";
import Menu from "../components/InvoicePage/Menu/Menu";

import { useInvoice } from "../contexts/InvoiceContext";
import { localTemplateService } from "../services/local-template-service";
import { ipfsService } from "../services/ipfs-service";
import { Meshkit } from "../meshkit/Meshkit";
import { getIpfsSettings } from "../utils/settings";
import { useHistory, useLocation, useParams } from "react-router-dom";
import CellEditModal from "../components/InvoicePage/CellEditModal/CellEditModal";
import { setupMouseListener } from "../components/InvoicePage/socialcalc/modules/listeners";
import { enableTouchScroll, disableTouchScroll } from "../components/InvoicePage/socialcalc/modules/touch-scroll.js";
import InvoiceSidebar from "../components/InvoicePage/InvoiceSidebar/InvoiceSidebar";
import {
  CustomEditIcon,
} from "../components/InvoicePage/InvoiceIcons";
import {
  generateEditableCells,
  extractTotalFromCell,
} from "../components/InvoicePage/InvoiceHelpers";

import { isQuotaExceededError, getQuotaExceededMessage } from "../utils/helper";
import { InvoiceGenerator } from "../utils/InvoiceGenerator";
import { SheetChangeMonitor } from "../utils/sheetChangeMonitor";
import { SaveIcon, ShareIcon, MoreIcon } from "../components/InvoicePage/HeaderIcons";
// import { useStatusBar, StatusBarPresets } from "../hooks/useStatusBar";
import { useStatusBar, StatusBarPresets } from "../hooks/useStatusBar";

const InvoicePage: React.FC = () => {

  const {
    selectedFile,
    billType,
    store,
    updateSelectedFile,
    updateBillType,
    activeTemplateData,
    activeTemplateId,
    updateActiveTemplateData,
    updateCurrentSheetId,
    currency,
  } = useInvoice();

  useStatusBar(StatusBarPresets.primary);

  // Offline mode - no auth needed
  const userId = 'offline_user';
  const history = useHistory();

  const [fileNotFound, setFileNotFound] = useState(false);
  const [templateNotFound, setTemplateNotFound] = useState(false);

  const { fileName } = useParams<{ fileName: string }>();

  const location = useLocation();

  // Parse URL query parameters
  const searchParams = new URLSearchParams(location.search);
  // New pattern: ?template=<id> for creating fresh invoice from template
  const templateFromUrl = searchParams.get('template');
  // Legacy pattern: ?templateId=<id>&mode=new (keep for backwards compatibility)
  const templateIdFromUrl = templateFromUrl || searchParams.get('templateId');
  const modeFromUrl = searchParams.get('mode');
  // New invoice mode: either using new ?template= pattern, or legacy ?templateId=&mode=new
  const isNewInvoiceMode = (templateFromUrl !== null) || (modeFromUrl === 'new' && templateIdFromUrl !== null);

  // State for tracking if invoice has been saved
  const [isInvoiceSaved, setIsInvoiceSaved] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastColor, setToastColor] = useState<
    "success" | "danger" | "warning"
  >("success");

  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [saveAsFileName, setSaveAsFileName] = useState("");
  const [saveAsOperation, setSaveAsOperation] = useState<"local" | null>(null);

  // Sidebar State
  const [showSidebar, setShowSidebar] = useState(false);

  // Cell Edit Modal State
  const [showCellEditModal, setShowCellEditModal] = useState(false);
  const [cellEditData, setCellEditData] = useState<{
    coord: string;
    text: string;
    okfn: (value: string) => void;
    cleanup?: () => void;
  } | null>(null);

  // Cell Edit Event Listener
  useEffect(() => {
    const handleCellEditRequest = (event: CustomEvent) => {
      const { coord, text, okfn, cleanup } = event.detail;
      setCellEditData({ coord, text, okfn, cleanup });
      setShowCellEditModal(true);
    };

    window.addEventListener('socialcalc:cell-edit-request', handleCellEditRequest as EventListener);
    return () => {
      window.removeEventListener('socialcalc:cell-edit-request', handleCellEditRequest as EventListener);
    };
  }, []);



  // Setup SocialCalc mouse listener for custom cell editing
  useEffect(() => {
    let cleanupFn: (() => void) | undefined;

    const intervalId = setInterval(() => {
      const sc = (window as any).SocialCalc;
      if (sc && sc.ProcessEditorMouseDown) {
        clearInterval(intervalId);
        // console.log("🖱️ Setup mouse listener for custom editing");
        cleanupFn = setupMouseListener();
      }
    }, 500);

    return () => {
      clearInterval(intervalId);
      if (cleanupFn) cleanupFn();
    };
  }, []);

  // Enable smooth touch scrolling on mobile devices
  useEffect(() => {
    const intervalId = setInterval(() => {
      const sc = (window as any).SocialCalc;
      if (sc && sc.HasTouch && sc.TouchInfo && sc.TouchInfo.registeredElements.length > 0) {
        clearInterval(intervalId);
        enableTouchScroll();
      }
    }, 600);

    return () => {
      clearInterval(intervalId);
      disableTouchScroll();
    };
  }, []);

  // Update SocialCalc currency symbol when currency changes
  useEffect(() => {
    const updateSocialCalcCurrency = () => {
      const sc = (window as any).SocialCalc;
      if (sc && sc.Constants) {
        try {
          const symbol = (0).toLocaleString(undefined, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }).replace(/\d/g, '').trim();

          if (symbol) {
            sc.Constants.FormatNumber_defaultCurrency = symbol;
          }
        } catch (e) {
          console.warn('Failed to set SocialCalc currency', e);
        }
      }
    };

    updateSocialCalcCurrency();
    // Retry a few times in case SocialCalc is initializing, with proper cleanup
    let retryCount = 0;
    const maxRetries = 6; // 6 retries * 500ms = 3000ms
    const interval = setInterval(() => {
      retryCount++;
      updateSocialCalcCurrency();
      if (retryCount >= maxRetries) {
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [currency]);



  const handleApplyAddress = (address: any) => {
    if (!activeTemplateData || !activeTemplateData.appMapping) return;

    const socialCalc = (window as any).SocialCalc;
    if (!socialCalc) return;

    const workbookControl = socialCalc.GetCurrentWorkBookControl();
    const currentSheetId = workbookControl.currentSheetButton.id;
    const sheetMapping = activeTemplateData.appMapping[currentSheetId];

    if (!sheetMapping) {
      setToastMessage("No mapping found for this sheet");
      setShowToast(true);
      return;
    }

    // Check for "From" (multi-cell form) or fallback to "FromAddress" (single cell)
    if (sheetMapping.From && sheetMapping.From.formContent) {
      // Multi-cell mode: map each address field to its own cell
      const formContent = sheetMapping.From.formContent;

      const fieldMappings: Record<string, string[]> = {
        'label': ['Name', 'CompanyName'],
        'streetAddress': ['StreetAddress'],
        'cityStateZip': ['CityStateZip'],
        'phone': ['Phone'],
        'email': ['Email'],
      };

      const commands: string[] = [];

      Object.entries(fieldMappings).forEach(([addressField, formKeys]) => {
        const value = address[addressField];
        if (value && value.trim()) {
          for (const formKey of formKeys) {
            if (formContent[formKey] && formContent[formKey].cell) {
              commands.push(`set ${formContent[formKey].cell} text t ${value}`);
              break;
            }
          }
        }
      });

      if (commands.length > 0) {
        try {
          const cmd = commands.join('\n') + '\n';
          const commandObj = {
            cmdtype: 'scmd',
            id: currentSheetId,
            cmdstr: cmd,
            saveundo: false,
          };
          workbookControl.ExecuteWorkBookControlCommand(commandObj, false);
          setToastMessage("Address applied!");
          setShowToast(true);
        } catch (e) {
          console.error("Failed to apply address:", e);
          setToastMessage("Failed to apply address");
          setShowToast(true);
        }
      } else {
        setToastMessage("No address data to apply");
        setShowToast(true);
      }
    } else if (sheetMapping.FromAddress && sheetMapping.FromAddress.cell) {
      // Single-cell fallback: combine all address parts into one cell, comma-separated
      const parts = [
        address.label,
        address.streetAddress,
        address.cityStateZip,
        address.phone ? `Phone: ${address.phone}` : null,
        address.email ? `Email: ${address.email}` : null,
      ].filter((p) => p && p.trim());

      if (parts.length > 0) {
        try {
          const combined = parts.join(', ');
          const cmd = `set ${sheetMapping.FromAddress.cell} text t ${combined}\n`;
          const commandObj = {
            cmdtype: 'scmd',
            id: currentSheetId,
            cmdstr: cmd,
            saveundo: false,
          };
          workbookControl.ExecuteWorkBookControlCommand(commandObj, false);
          setToastMessage("Address applied!");
          setShowToast(true);
        } catch (e) {
          console.error("Failed to apply address:", e);
          setToastMessage("Failed to apply address");
          setShowToast(true);
        }
      } else {
        setToastMessage("No address data to apply");
        setShowToast(true);
      }
    } else {
      setToastMessage("Company address section not mapped in this template");
      setShowToast(true);
      return;
    }
  };

  const handleApplyInventory = (item: any, quantity: number = 1) => {
    if (!activeTemplateData || !activeTemplateData.appMapping) return;

    const socialCalc = (window as any).SocialCalc;
    if (!socialCalc) return;

    const workbookControl = socialCalc.GetCurrentWorkBookControl();
    const currentSheetId = workbookControl.currentSheetButton.id;
    const sheet = workbookControl.workbook.sheetArr[currentSheetId].sheet;
    const sheetMapping = activeTemplateData.appMapping[currentSheetId];

    // Find Items table
    const itemsTableKey = Object.keys(sheetMapping).find(k => sheetMapping[k].type === 'table');
    if (!itemsTableKey) {
      setToastMessage("Items table not mapped in this template");
      setShowToast(true);
      return;
    }

    const tableMapping = sheetMapping[itemsTableKey];
    const rows = tableMapping.rows;
    const cols = tableMapping.col;

    // Determine which column is primary (Description usually) to check for empty
    const descKey = Object.keys(cols).find(k => k.toLowerCase().includes("desc") || k.toLowerCase().includes("item"));
    if (!descKey || !cols[descKey].cell) {
      setToastMessage("Description column not found in mapping");
      setShowToast(true);
      return;
    }

    const descColChar = cols[descKey].cell.replace(/[0-9]/g, ''); // Extract 'B' from 'B18'

    // Find first empty row
    let targetRow = -1;
    for (let r = rows.start; r <= rows.end; r++) {
      const cellRef = `${descColChar}${r}`;
      const cell = sheet.cells[cellRef];
      if (!cell || (!cell.datavalue && !cell.displaystring) || (cell.datavalue === "") || (cell.displaystring === "")) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) {
      setToastMessage("No empty rows available in Items table");
      setShowToast(true);
      return;
    }

    // Check for "Detailed" vs "Compact" mode based on available columns
    const colKeys = Object.keys(cols);
    const hasQtyCol = colKeys.some(k => {
      const lower = k.toLowerCase();
      // Check for quantity/hours columns
      return lower.includes("qty") || lower.includes("quantity") || lower.includes("unit") || lower.includes("hour") || lower.includes("hrs");
    });
    const hasPriceCol = colKeys.some(k => {
      const lower = k.toLowerCase();
      // Check for price/rate columns
      return lower.includes("price") || lower.includes("rate") || lower.includes("cost");
    });

    // If we have specific columns for Qty or Price, we treat it as Detailed mode
    // Otherwise it is Compact mode (Description + Amount only)
    const isDetailedMode = hasQtyCol || hasPriceCol;

    const commands: string[] = [];

    // Map Item fields to Columns
    Object.keys(cols).forEach(colName => {
      const colMapping = cols[colName];
      if (colMapping.cell) {
        const colChar = colMapping.cell.replace(/[0-9]/g, '');
        // Use local cell reference (e.g. "B23"), NOT "sheet1!B23"
        const targetCell = `${colChar}${targetRow}`;

        const lowerName = colName.toLowerCase();
        let value: string | number = "";
        let type = "text"; // 'text' or 'value'

        if (lowerName.includes("desc") || lowerName.includes("item")) {
          // Description
          if (isDetailedMode) {
            value = item.name;
          } else {
            // Compact Mode: Add 'x Qty' to description if qty > 1
            value = quantity > 1 ? `${item.name} x ${quantity}` : item.name;
          }
          type = "text";
        } else if (lowerName.includes("qty") || lowerName.includes("quantity") || lowerName.includes("unit") || lowerName.includes("hour") || lowerName.includes("hrs")) {
          // Quantity / Units / Hours
          value = quantity;
          type = "value";
        } else if (lowerName.includes("price") || lowerName.includes("rate") || lowerName.includes("cost")) {
          // Unit Price
          value = item.price;
          type = "value";
        } else if (lowerName.includes("amount") || lowerName.includes("total")) {
          // Total Amount
          if (!isDetailedMode) {
            // In Compact mode, we MUST calculate it ourselves
            value = (item.price || 0) * quantity;
            type = "value";
          } else {
            // In Detailed mode, rely on sheet formula
            return;
          }
        }

        if (value !== "") {
          if (type === "value") {
            commands.push(`set ${targetCell} value n ${value}`);
          } else {
            // Escape any special characters if necessary, but basic text is usually fine
            commands.push(`set ${targetCell} text t ${value}`);
          }
        }
      }
    });

    // Execute all commands batch
    if (commands.length > 0) {
      try {
        const cmd = commands.join('\n') + '\n';
        const commandObj = {
          cmdtype: 'scmd',
          id: currentSheetId,
          cmdstr: cmd,
          saveundo: true, // It's good to allow undo for item addition
        };
        workbookControl.ExecuteWorkBookControlCommand(commandObj, false);
        setToastMessage(`Added "${item.name}" (x${quantity}) to invoice`);
      } catch (e) {
        console.error("Failed to add inventory item:", e);
        setToastMessage("Failed to add item to invoice");
      }
    } else {
      setToastMessage("No mappable item data found");
    }
    setShowToast(true);
  };

  // Handlers for Logo/Signature Application
  const handleSelectLogo = (logo: { data: string } | string | null) => {
    if (!activeTemplateData) {
      setToastMessage("No active template data"); setShowToast(true); return;
    }
    const socialCalc = (window as any).SocialCalc;
    if (!socialCalc) return;
    const workbookControl = socialCalc.GetCurrentWorkBookControl();
    const currentSheetId = workbookControl.currentSheetButton.id;

    const sheetMapping = activeTemplateData.appMapping?.[currentSheetId];
    const logoCoordinate = sheetMapping?.['Logo']?.type === 'image' ? sheetMapping['Logo'].cell : null;

    if (!logoCoordinate) {
      setToastMessage("Logo position not defined in template"); setShowToast(true); return;
    }

    try {
      // Check for null or empty string to clear the logo
      if (logo === null || logo === "") {
        // Clear the logo by erasing cell content
        AppGeneral.removeLogo({ [currentSheetId]: logoCoordinate });
        setToastMessage("Logo removed!"); setShowToast(true);
      } else if (typeof logo === 'object' && logo.data) {
        AppGeneral.addLogo({ [currentSheetId]: logoCoordinate }, logo.data);
        setToastMessage("Logo applied!"); setShowToast(true);
      }
    } catch (e) {
      setToastMessage("Failed to apply logo"); setShowToast(true);
    }
  };

  const handleSelectSignature = (sig: { data: string } | string | null) => {
    if (!activeTemplateData) {
      setToastMessage("No active template data"); setShowToast(true); return;
    }
    const socialCalc = (window as any).SocialCalc;
    if (!socialCalc) return;
    const workbookControl = socialCalc.GetCurrentWorkBookControl();
    const currentSheetId = workbookControl.currentSheetButton.id;

    const sheetMapping = activeTemplateData.appMapping?.[currentSheetId];
    const sigCoordinate = sheetMapping?.['Signature']?.type === 'image' ? sheetMapping['Signature'].cell : null;

    if (!sigCoordinate) {
      setToastMessage("Signature position not defined in template"); setShowToast(true); return;
    }

    try {
      // Check for null or empty string to clear the signature
      if (sig === null || sig === "") {
        // Clear the signature by erasing cell content
        AppGeneral.removeLogo({ [currentSheetId]: sigCoordinate });
        setToastMessage("Signature removed!"); setShowToast(true);
      } else if (typeof sig === 'object' && sig.data) {
        AppGeneral.addLogo({ [currentSheetId]: sigCoordinate }, sig.data); // Reusing addLogo logic for signature image
        setToastMessage("Signature applied!"); setShowToast(true);
      }
    } catch (e) {
      setToastMessage("Failed to apply signature"); setShowToast(true);
    }
  };



  // Autosave state (kept for sidebar compatibility)
  const [autosaveCount, setAutosaveCount] = useState(0);

  // Save Invoice Dialog state
  const [showSaveInvoiceDialog, setShowSaveInvoiceDialog] = useState(false);
  const [saveInvoiceName, setSaveInvoiceName] = useState("");

  // IPFS state variables
  const [showIpfsAlert, setShowIpfsAlert] = useState(false);
  const [ipfsCid, setIpfsCid] = useState("");
  const [ipfsStatus, setIpfsStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [ipfsErrorMsg, setIpfsErrorMsg] = useState("");

  // Color picker state
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorMode, setColorMode] = useState<"background" | "font">(
    "background"
  );
  const [customColorInput, setCustomColorInput] = useState("");
  const [activeBackgroundColor, setActiveBackgroundColor] = useState("#f4f5f8");
  const [activeFontColor, setActiveFontColor] = useState("#000000");

  // Actions popover state
  const [showActionsPopover, setShowActionsPopover] = useState(false);

  // Hardware Back Button Handler
  // Use a ref to keep track of the current state values for the event listener
  const stateRef = React.useRef({
    showSidebar,
    showMenu,
    showCellEditModal,
    showColorModal,
    showSaveAsDialog,
    showSaveInvoiceDialog,
    showActionsPopover,
  });

  // Update the ref whenever state changes
  useEffect(() => {
    stateRef.current = {
      showSidebar,
      showMenu,
      showCellEditModal,
      showColorModal,
      showSaveAsDialog,
      showSaveInvoiceDialog,
      showActionsPopover,
    };
  }, [
    showSidebar,
    showMenu,
    showCellEditModal,
    showColorModal,
    showSaveAsDialog,
    showSaveInvoiceDialog,
    showActionsPopover,
  ]);

  // Hardware Back Button Handler using Ionic's ionBackButton event with higher priority
  useEffect(() => {
    const handleBackButton = (ev: any) => {
      // Register with priority 100 (higher than DashboardLayout's priority 10)
      ev.detail.register(100, () => {
        const state = stateRef.current;

        // Close any open modal/sidebar/popover first
        if (state.showSidebar) {
          setShowSidebar(false);
        } else if (state.showMenu) {
          setShowMenu(false);
        } else if (state.showCellEditModal) {
          setShowCellEditModal(false);
          if (cellEditData?.cleanup) {
            cellEditData.cleanup();
          }
          setCellEditData(null);
        } else if (state.showColorModal) {
          setShowColorModal(false);
        } else if (state.showSaveAsDialog) {
          setShowSaveAsDialog(false);
          setSaveAsFileName("");
          setSaveAsOperation(null);
        } else if (state.showSaveInvoiceDialog) {
          setShowSaveInvoiceDialog(false);
          setSaveInvoiceName("");
        } else if (state.showActionsPopover) {
          setShowActionsPopover(false);
        } else {
          // No modals open, navigate back to dashboard (same as header back button)
          window.location.href = "/app/dashboard";
        }
      });
    };

    document.addEventListener('ionBackButton', handleBackButton);

    return () => {
      document.removeEventListener('ionBackButton', handleBackButton);
    };
  }, [cellEditData]);


  // Available colors for sheet themes
  const availableColors = [
    { name: "red", label: "Red", color: "#ff4444" },
    { name: "blue", label: "Blue", color: "#3880ff" },
    { name: "green", label: "Green", color: "#2dd36f" },
    { name: "yellow", label: "Yellow", color: "#ffc409" },
    { name: "purple", label: "Purple", color: "#6f58d8" },
    { name: "black", label: "Black", color: "#000000" },
    { name: "white", label: "White", color: "#ffffff" },
    { name: "default", label: "Default", color: "#f4f5f8" },
  ];

  const handleColorChange = (colorName: string) => {
    try {
      // Get the actual color value (hex) for the color name
      const selectedColor = availableColors.find((c) => c.name === colorName);
      const colorValue = selectedColor ? selectedColor.color : colorName;

      if (colorMode === "background") {
        AppGeneral.changeSheetBackgroundColor(colorName);
        setActiveBackgroundColor(colorValue);
      } else {
        AppGeneral.changeSheetFontColor(colorName);
        setActiveFontColor(colorValue);
      }
    } catch (error) {
      setToastMessage("Failed to change sheet color");
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const executeSaveAsWithFilename = async (newFilename: string) => {
    updateSelectedFile(newFilename);

    if (saveAsOperation === "local") {
      await performLocalSave(newFilename);

      // If we're saving a new invoice (from placeholder), navigate to the new URL
      if (fileName === "invoice") {
        history.replace(`/app/editor/${newFilename}`);
      }
    }
    setSaveAsFileName("");
    setSaveAsOperation(null);
  };

  const performLocalSave = async (fileName: string) => {
    try {
      // Check if SocialCalc is ready
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      const control = socialCalc.GetCurrentWorkBookControl();
      if (!control || !control.workbook || !control.currentSheetButton) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      // Get the current sheet ID and sheet object
      const currentSheetId = control.currentSheetButton.id;
      const currentSheet = control.workbook.sheetArr?.[currentSheetId]?.sheet;

      if (!currentSheet) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      const now = new Date().toISOString();

      // Get template ID from active template ID or fallback
      const templateId = activeTemplateId || billType;

      // Helper function to extract Bill To details
      const extractBillToDetailsLocal = (appMapping: any, sheetName: string, sheet: any): any => {
        const sheetMapping = appMapping?.[sheetName];
        if (!sheetMapping || !sheetMapping.BillTo || !sheetMapping.BillTo.formContent) return null;

        const details: any = {};
        const formContent = sheetMapping.BillTo.formContent;

        for (const [key, field] of Object.entries(formContent)) {
          if ((field as any).cell) {
            const cellRef = (field as any).cell;
            if (sheet.cells && sheet.cells[cellRef]) {
              let val = sheet.cells[cellRef].datavalue;
              if (val === undefined || val === null) {
                val = sheet.cells[cellRef].displaystring;
              }
              details[key] = val || "";
            }
          }
        }
        return details;
      };

      // Helper function to clean and parse currency string
      const parsePossibleCurrencyLocal = (val: string | number): number | null => {
        if (typeof val === 'number') return val;
        if (!val) return null;
        const clean = val.replace(/[^0-9.-]+/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
      };

      // Force recalculation before saving
      try {
        if (control.ExecuteWorkBookControlCommand) {
          control.ExecuteWorkBookControlCommand({ cmd: "recalc", saveundo: false }, false);
        }
      } catch (e) {
        if (import.meta.env.DEV) console.log("⚠️ performLocalSave: Recalc failed (non-critical)", e);
      }

      // Extract total value from the mapped cell
      let totalValue: number | null = null;
      try {
        const totalCellRef = extractTotalFromCell(activeTemplateData?.appMapping, currentSheetId);
        if (totalCellRef && currentSheet.cells && currentSheet.cells[totalCellRef]) {
          const cell = currentSheet.cells[totalCellRef];
          if (cell.datavalue !== undefined) {
            totalValue = parsePossibleCurrencyLocal(cell.datavalue);
          }
          if (totalValue === null && cell.displaystring) {
            totalValue = parsePossibleCurrencyLocal(cell.displaystring);
          }
        }
      } catch (e) {
        if (import.meta.env.DEV) console.log("⚠️ performLocalSave: Could not extract total value (non-critical)", e);
      }

      // Extract Bill To details for metadata
      let billToDetails = null;
      try {
        billToDetails = extractBillToDetailsLocal(activeTemplateData?.appMapping, currentSheetId, currentSheet);
      } catch (e) {
        if (import.meta.env.DEV) console.log("⚠️ performLocalSave: Could not extract Bill To details (non-critical)", e);
      }

      // Save to local storage via localTemplateService with metadata
      await localTemplateService.saveInvoice({
        id: fileName,
        name: fileName,
        templateId: templateId,
        content: content,
        billType: billType,
        total: totalValue || 0,
        billToDetails: billToDetails
      });

      // Also save to local File store for backup/consistency
      const file = new File(
        now,
        now,
        content,
        fileName,
        billType,
        templateId,
        false
      );
      await store._saveFile(file);
      await store._addToRecentInvoices(fileName);

      // Update state to reflect saved invoice
      setIsInvoiceSaved(true);
      setCurrentInvoiceId(fileName);

      setToastMessage(`File "${fileName}" saved successfully!`);
      setToastColor("success");
      setShowToast(true);
    } catch (error) {
      // Check if the error is due to storage quota exceeded
      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("saving files"));
      } else {
        setToastMessage("Failed to save file locally.");
      }
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const extractInvoiceIdFromSheet = (): string | null => {
    try {
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) return null;

      const control = socialCalc.GetCurrentWorkBookControl();
      if (!control || !control.workbook || !control.currentSheetButton) return null;

      const currentSheetId = control.currentSheetButton.id;
      const currentSheet = control.workbook.sheetArr?.[currentSheetId]?.sheet;

      if (!currentSheet || !activeTemplateData?.appMapping) return null;

      const mapping = activeTemplateData.appMapping[currentSheetId];
      if (mapping && mapping.InvoiceNumber && mapping.InvoiceNumber.cell) {
        const cellRef = mapping.InvoiceNumber.cell;
        if (currentSheet.cells[cellRef]) {
          const val = currentSheet.cells[cellRef].datavalue || currentSheet.cells[cellRef].displaystring;
          return val ? String(val).trim() : null;
        }
      }
    } catch (e) {
      console.warn("Failed to extract invoice ID", e);
    }
    return null;
  };

  const handleSave = async (invoiceName?: string, isAutoSave: boolean = false) => {
    // If no file is selected, can't save
    if (!fileName) {
      return;
    }

    // Don't try to save if template is not found
    if (templateNotFound || fileNotFound) {
      return;
    }

    // Determine the effective filename
    let targetFileName = invoiceName || fileName;

    // If it's the placeholder "invoice", we CANNOT auto-save or save without a name.
    // The user must go through the Save As flow (handled in UI).
    // If handleSave is called with "invoice" and no name, it typically returns,
    // EXCEPTION: If we can extract the ID from the sheet, we might propose that?
    // But typically for "invoice", we want the dialog.
    if (targetFileName === "invoice" && !invoiceName) {
      return;
    }

    try {
      // Check if SocialCalc is ready
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) {
        // console.log("⚠️ handleSave: SocialCalc not ready, skipping save");
        return;
      }

      const control = socialCalc.GetCurrentWorkBookControl();

      // Strict check for control readiness
      if (!control || !control.workbook || !control.currentSheetButton) {
        // console.log("⚠️ handleSave: Control/Workbook not ready, skipping save");
        return;
      }

      // Get the current sheet ID and sheet object
      const currentSheetId = control.currentSheetButton.id;
      const currentSheet = control.workbook.sheetArr?.[currentSheetId]?.sheet;

      if (!currentSheet) {
        // console.log("⚠️ handleSave: Current sheet not found, skipping save");
        return;
      }

      // --- SMART NAMING LOGIC ---
      // Try to get the Invoice ID from the sheet
      if (!isAutoSave) {
        const sheetInvoiceId = extractInvoiceIdFromSheet();
        if (sheetInvoiceId && sheetInvoiceId !== targetFileName) {
          // The Invoice ID in the sheet is different from the current filename.
          // This implies a Rename / Save As.

          // Check for collision
          const exists = await localTemplateService.invoiceExists(sheetInvoiceId);

          if (exists) {
            // Alert user
            setToastMessage(`Invoice ID "${sheetInvoiceId}" already exists! Please use a unique ID.`);
            setToastColor("danger");
            setShowToast(true);
            return; // ABORT SAVE
          }

          // If valid, update targetFileName to the one from the sheet
          targetFileName = sheetInvoiceId;
        }
      }
      // --------------------------

      // console.log("📄 handleSave: Getting spreadsheet content");
      // Safe content retrieval
      let content = "";
      try {
        content = encodeURIComponent(AppGeneral.getSpreadsheetContent());
      } catch (e) {
        console.error("❌ handleSave: Failed to get spreadsheet content", e);
        return;
      }

      if (!activeTemplateData) {
        // console.log("⚠️ handleSave: No active template data, skipping save");
        return;
      }

      // Helper function to extract Bill To details
      const extractBillToDetails = (appMapping: any, sheetName: string, sheet: any): any => {
        const sheetMapping = appMapping?.[sheetName];
        if (!sheetMapping || !sheetMapping.BillTo || !sheetMapping.BillTo.formContent) return null;

        const details: any = {};
        const formContent = sheetMapping.BillTo.formContent;

        for (const [key, field] of Object.entries(formContent)) {
          if ((field as any).cell) {
            const cellRef = (field as any).cell;
            if (sheet.cells && sheet.cells[cellRef]) {
              // Try to get the datavalue first, then displaystring
              let val = sheet.cells[cellRef].datavalue;
              if (val === undefined || val === null) {
                val = sheet.cells[cellRef].displaystring;
              }
              details[key] = val || "";
            }
          }
        }
        return details;
      };

      // Helper function to clean and parse currency string
      const parsePossibleCurrency = (val: string | number): number | null => {
        if (typeof val === 'number') return val;
        if (!val) return null;
        // Remove currency symbols, commas, spaces
        const clean = val.replace(/[^0-9.-]+/g, "");
        const num = parseFloat(clean);
        return isNaN(num) ? null : num;
      };

      // Force recalculation before saving to ensure totals are up to date
      try {
        if (control.ExecuteWorkBookControlCommand) {
          control.ExecuteWorkBookControlCommand({
            cmd: "recalc",
            saveundo: false
          }, false);
        }
      } catch (e) {
        if (import.meta.env.DEV) console.log("⚠️ handleSave: Recalc failed (non-critical)", e);
      }

      // Extract total value from the mapped cell using the current sheet
      let totalValue: number | null = null;
      try {
        const totalCellRef = extractTotalFromCell(activeTemplateData.appMapping, currentSheetId);
        if (totalCellRef) {
          if (currentSheet && currentSheet.cells && currentSheet.cells[totalCellRef]) {
            const cell = currentSheet.cells[totalCellRef];
            // Try datavalue first
            if (cell.datavalue !== undefined) {
              // console.log("DEBUG: cell.datavalue", cell.datavalue);
              totalValue = parsePossibleCurrency(cell.datavalue);
            }
            // If still null or NaN, try displaystring
            if (totalValue === null && cell.displaystring) {
              // console.log("DEBUG: cell.displaystring", cell.displaystring);
              totalValue = parsePossibleCurrency(cell.displaystring);
            }
            // console.log("DEBUG: extracted totalValue", totalValue, "from cell", totalCellRef);
          } else {
            // console.log("DEBUG: Cell not found for total extraction", totalCellRef);
          }
        } else {
          // console.log("DEBUG: totalCellRef not found");
        }
      } catch (e) {
        if (import.meta.env.DEV) console.log("⚠️ handleSave: Could not extract total value (non-critical)", e);
      }

      // Extract Bill To details for metadata
      let billToDetails = null;
      try {
        billToDetails = extractBillToDetails(activeTemplateData.appMapping, currentSheetId, currentSheet);
      } catch (e) {
        if (import.meta.env.DEV) console.log("⚠️ handleSave: Could not extract Bill To details (non-critical)", e);
      }

      // console.log("💾 handleSave: Saving to local storage", { targetFileName, totalValue });

      // Save to local storage via localTemplateService with metadata
      await localTemplateService.saveInvoice({
        id: targetFileName,
        name: targetFileName,
        templateId: activeTemplateId || billType,
        content: content,
        billType: billType,
        total: totalValue || 0, // Ensure it defaults to 0 if extraction failed
        billToDetails: billToDetails
      });

      // Update state to reflect saved invoice
      setIsInvoiceSaved(true);
      setCurrentInvoiceId(targetFileName);

      // If filename changed (rename), update the URL
      if (targetFileName !== fileName) {
        updateSelectedFile(targetFileName);
        history.replace(`/app/editor/${targetFileName}`);
      }

      // Also save to local File store for backup/consistency
      const file = new File(
        new Date().toISOString(),
        new Date().toISOString(),
        content,
        targetFileName,
        billType,
        activeTemplateId || billType,
        false
      );
      await store._saveFile(file);
      await store._addToRecentInvoices(targetFileName);

      // console.log("✅ handleSave: Save completed successfully");
    } catch (error) {
      console.error("❌ handleSave: Error during save", error);

      // Check if the error is due to storage quota exceeded
      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("auto-saving"));
        setToastColor("danger");
        setShowToast(true);
      } else {
        // For auto-save errors, show a less intrusive message
        setToastMessage("Auto-save failed. Please save manually.");
        setToastColor("warning");
        setShowToast(true);
      }
    }
  };

  const handleCloudImportSuccess = (importedFileName: string) => {
    setShowCloudModal(false);
    history.push(`/app/editor/${importedFileName}`);
    window.location.reload();
  };

  const handleSaveClick = async () => {
    // console.log("💾 handleSaveClick: Starting manual save");

    if (!fileName) {
      setToastMessage("No file selected to save.");
      setToastColor("warning");
      setShowToast(true);
      return;
    }

    try {
      // Check if SocialCalc is ready
      const socialCalc = (window as any).SocialCalc;
      if (!socialCalc || !socialCalc.GetCurrentWorkBookControl) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      const control = socialCalc.GetCurrentWorkBookControl();
      if (!control || !control.workbook || !control.workbook.spreadsheet) {
        setToastMessage("Spreadsheet not ready. Please wait and try again.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      if (!activeTemplateData) {
        setToastMessage("No template data available for saving.");
        setToastColor("warning");
        setShowToast(true);
        return;
      }

      // Call the main save function
      await handleSave();

      // Show success toast for manual save
      setToastMessage("File saved successfully!");
      setToastColor("success");
      setShowToast(true);
      if (import.meta.env.DEV) console.log("✅ handleSaveClick: Manual save completed successfully");
    } catch (error) {
      console.error("❌ handleSaveClick: Error during manual save", error);

      if (isQuotaExceededError(error)) {
        setToastMessage(getQuotaExceededMessage("saving files"));
      } else {
        setToastMessage("Failed to save file. Please try again.");
      }
      setToastColor("danger");
      setShowToast(true);
    }
  };

  const handleSaveToIpfs = async () => {
    if (fileName === "invoice" || !isInvoiceSaved) {
      setToastMessage("Please save your invoice locally before uploading to IPFS.");
      setToastColor("warning");
      setShowToast(true);
      
      const suggestedName = extractInvoiceIdFromSheet() || "";
      setSaveInvoiceName(suggestedName);
      setShowSaveInvoiceDialog(true);
      return;
    }

    try {
      setIpfsStatus("saving");
      setToastMessage("Saving invoice locally first...");
      setToastColor("success");
      setShowToast(true);

      // Perform local save first to make sure content is updated
      await handleSave();

      setToastMessage("Uploading to IPFS via Pinata...");
      setShowToast(true);

      // Fetch invoice from localTemplateService to get metadata + content
      const savedInvoice = await localTemplateService.getInvoice(fileName);
      if (!savedInvoice) {
        throw new Error("Could not find saved invoice in local storage.");
      }

      const mk = await Meshkit.init({
        provider: "pinata",
        providerToken: getIpfsSettings().ipfsPinataJwt,
      });

      const pinResult = await mk.store(savedInvoice);

      setIpfsCid(pinResult.cid);
      setIpfsStatus("success");

      // Save details to IPFS history
      try {
        const historyStr = localStorage.getItem("ipfs_pinned_history") || "[]";
        const historyList = JSON.parse(historyStr);
        const updatedList = [
          {
            cid: pinResult.cid,
            name: savedInvoice.name,
            timestamp: new Date(pinResult.timestamp).toISOString(),
            total: savedInvoice.total
          },
          ...historyList.filter((item: any) => item.cid !== pinResult.cid)
        ].slice(0, 50);
        localStorage.setItem("ipfs_pinned_history", JSON.stringify(updatedList));
      } catch (e) {
        console.warn("Failed to update local IPFS history:", e);
      }

      // Copy CID to clipboard
      try {
        await navigator.clipboard.writeText(pinResult.cid);        setToastMessage("IPFS CID copied to clipboard!");
        setToastColor("success");
        setShowToast(true);
      } catch (e) {
        // ignore clipboard error
      }

      setShowIpfsAlert(true);
    } catch (error: any) {
      console.error("Failed to save to IPFS:", error);
      setIpfsStatus("error");
      setIpfsErrorMsg(error.message || String(error));
      setToastMessage(`IPFS Upload Failed: ${error.message || error}`);
      setToastColor("danger");
      setShowToast(true);
      setShowIpfsAlert(true);
    }
  };

  const activateFooter = (footer) => {
    if (import.meta.env.DEV) console.log("🦶 activateFooter: Starting footer activation", { footer });
    // Only activate footer if SocialCalc is properly initialized
    try {
      const tableeditor = document.getElementById("tableeditor");
      const socialCalc = (window as any).SocialCalc;
      if (import.meta.env.DEV) console.log("🔍 activateFooter: Checking DOM and SocialCalc", {
        hasTableEditor: !!tableeditor,
        hasSocialCalc: !!socialCalc,
        hasGetCurrentWorkBookControl: !!(
          socialCalc && socialCalc.GetCurrentWorkBookControl
        ),
      });

      // Check if SocialCalc and WorkBook control are properly initialized
      if (tableeditor && socialCalc && socialCalc.GetCurrentWorkBookControl) {
        const control = socialCalc.GetCurrentWorkBookControl();
        if (import.meta.env.DEV) console.log("📋 activateFooter: Control status", {
          hasControl: !!control,
          hasWorkbook: !!(control && control.workbook),
          hasSpreadsheet: !!(
            control &&
            control.workbook &&
            control.workbook.spreadsheet
          ),
        });
        if (control && control.workbook && control.workbook.spreadsheet) {
          // console.log(
          //   "✅ activateFooter: All requirements met, activating footer"
          // );
          AppGeneral.activateFooterButton(footer);
        } else {
          // console.log(
          //   "⚠️ activateFooter: SocialCalc WorkBook not ready for footer activation, skipping"
          // );
        }
      } else {
        // console.log(
        //   "⚠️ activateFooter: SocialCalc not ready for footer activation, skipping"
        // );
      }
    } catch (error) {
      // console.error("❌ activateFooter: Error activating footer", error);
    }
  };

  const initializeApp = async () => {
    // console.log("🚀 initializeApp: Starting initialization", { fileName, isNewInvoiceMode, templateIdFromUrl });

    try {
      // Prioritize URL parameter over context to ensure fresh state
      let fileToLoad = fileName;
      // console.log("📁 initializeApp: File to load", { fileToLoad });

      // If no file is specified, redirect to files page
      // But allow 'invoice' as a placeholder for new invoices from template
      if (!fileToLoad || fileToLoad === "") {
        // console.log(
        //   "⚠️ initializeApp: No file specified, redirecting to files"
        // );
        history.push("/app/files");
        return;
      }

      // If fileName is 'invoice' (placeholder) but no template specified, redirect (unless we have IPFS temp data)
      if (fileToLoad === "invoice" && !isNewInvoiceMode && !localStorage.getItem("ipfs_temp_invoice_content")) {
        // console.log("⚠️ initializeApp: 'invoice' placeholder without template, redirecting to home");
        history.push("/app/dashboard/home");
        return;
      }

      let contentToLoad: string = "";
      let templateData: any = null;
      let templateId: string | number = "";
      let footerIndex = 1;

      // Check if we are loading an IPFS invoice loaded temporarily (unsaved)
      const ipfsTempContentStr = localStorage.getItem("ipfs_temp_invoice_content");
      if (ipfsTempContentStr) {
        localStorage.removeItem("ipfs_temp_invoice_content");
        try {
          const tempInvoice = JSON.parse(ipfsTempContentStr);
          setIsInvoiceSaved(false);
          setCurrentInvoiceId(null);

          let content = tempInvoice.content;
          let storedAppMapping: any = null;
          let storedFooter: any = null;

          if (typeof content === 'string') {
            try {
              content = decodeURIComponent(content);
            } catch (e) {
              // Ignore
            }
          }

          if (typeof content === 'object' && content.msc !== undefined) {
            storedAppMapping = content.appMapping;
            storedFooter = content.footer;
            content = content.msc;
            if (typeof content === 'object') {
              content = JSON.stringify(content);
            }
          } else if (typeof content === 'object') {
            content = JSON.stringify(content);
          }

          contentToLoad = content;
          templateId = tempInvoice.templateId;
          footerIndex = tempInvoice.billType || tempInvoice.footerIndex || 1;

          if (storedAppMapping) {
            templateData = {
              appMapping: storedAppMapping,
              footers: storedFooter ? [storedFooter] : [],
              msc: { currentid: 'sheet1' }
            };
          }

          if (!templateData && templateId) {
            try {
              const tryFetchTemplate = async (baseId: string): Promise<any> => {
                const userTemplate = await localTemplateService.getUserTemplate(baseId);
                if (userTemplate) return userTemplate.data;
                const numId = parseInt(baseId, 10);
                if (!isNaN(numId)) {
                  const storeTemplate = await localTemplateService.fetchStoreTemplate(numId);
                  if (storeTemplate) return storeTemplate.data;
                }
                return null;
              };
              const template = await tryFetchTemplate(String(templateId));
              if (template) {
                templateData = template;
              }
            } catch (e) {
              console.error("Failed to load template data for IPFS invoice fallback:", e);
            }
          }

          if (!templateData) {
            templateData = {
              appMapping: {},
              footers: [],
              msc: { currentid: 'sheet1' }
            };
          }
        } catch (e) {
          console.error("Failed to parse/load temp IPFS content:", e);
        }
      }

      // ========== MODE 1: NEW INVOICE FROM TEMPLATE ==========
      if (!contentToLoad && isNewInvoiceMode && templateIdFromUrl) {
        // console.log("📝 initializeApp: NEW INVOICE MODE - Loading template", { templateIdFromUrl });
        setIsInvoiceSaved(false);

        // Fetch template data from local storage - try user templates first, then store templates
        try {
          // HELPER: Function to try fetching with variances
          const tryFetchTemplate = async (baseId: string): Promise<any> => {
            // 1. Try user templates first
            const userTemplate = await localTemplateService.getUserTemplate(baseId);
            if (userTemplate) return userTemplate.data;

            // 2. Try store templates (by numeric ID)
            const numId = parseInt(baseId, 10);
            if (!isNaN(numId)) {
              const storeTemplate = await localTemplateService.fetchStoreTemplate(numId);
              if (storeTemplate) return storeTemplate.data;
            }

            return null;
          };

          // Try original ID
          let template = await tryFetchTemplate(templateIdFromUrl);

          if (template) {
            // console.log("✅ initializeApp: Template loaded from local storage");
            templateData = template;
            if (!templateId) templateId = templateIdFromUrl;
          }
        } catch (e) {
          // console.log("❌ initializeApp: Failed to fetch template", e);
        }

        if (!templateData) {
          // console.log("❌ initializeApp: Template not found", { templateIdFromUrl });
          setTemplateNotFound(true);
          setFileNotFound(false);
          return;
        }

        // Generate EditableCells from appMapping
        const editableCells = generateEditableCells(templateData.appMapping, 'sheet1');
        // console.log("🔧 initializeApp: Generated EditableCells", { cellCount: Object.keys(editableCells.cells).length });

        // Update the MSC with EditableCells
        const mscWithEditableCells = {
          ...templateData.msc,
          EditableCells: editableCells
        };

        // Convert to string format for SocialCalc
        contentToLoad = JSON.stringify(mscWithEditableCells);

        // Get active footer
        const activeFooter = templateData.footers?.find((f: any) => f.isActive);
        footerIndex = activeFooter?.index || 1;

      }
      // ========== MODE 2: EXISTING INVOICE ==========
      else if (!contentToLoad) {
        // console.log("📂 initializeApp: EXISTING INVOICE MODE - Loading saved invoice");
        setIsInvoiceSaved(true);

        // Check if the file exists in local storage
        // console.log("🔍 initializeApp: Checking local storage");
        let fileData: any = null;

        // Try localTemplateService first for saved invoices
        const localInvoice = await localTemplateService.getInvoice(fileToLoad);
        if (localInvoice) {
          // console.log("✅ initializeApp: Found in local storage", {
          //   hasContent: !!localInvoice.content,
          //   templateId: localInvoice.templateId,
          // });

          // Content might be a string or object
          let content = localInvoice.content;
          if (typeof content === 'string') {
            // Check if it's URL-encoded
            try {
              content = decodeURIComponent(content);
            } catch (e) {
              // Not encoded, use as-is
            }
          }

          fileData = {
            ...localInvoice,
            content: content,
            templateId: localInvoice.templateId,
            billType: localInvoice.billType || 1,
          };

          // Store invoice ID if present
          if (localInvoice.id) {
            setCurrentInvoiceId(localInvoice.id);
          }
        }

        // Fallback to store._checkKey for legacy File-based storage
        if (!fileData) {
          console.log("🔍 initializeApp: Checking legacy local storage");
          const fileExists = await store._checkKey(fileToLoad);
          if (fileExists) {
            fileData = await store._getFile(fileToLoad);
          }
        }

        // Add to recent invoices if found
        if (fileData) {
          store._addToRecentInvoices(fileToLoad);
        }

        if (!fileData) {
          // console.log("❌ initializeApp: File not found in storage");
          setFileNotFound(true);
          return;
        }

        // Load the file content
        // console.log("📖 initializeApp: Loading file data");
        let decodedContent = fileData.content;

        // Check if this is the new invoice format with {msc, appMapping, footer}
        let storedAppMapping: any = null;
        let storedFooter: any = null;

        if (typeof decodedContent === 'object' && decodedContent.msc !== undefined) {
          // New format: extract components
          // console.log("📦 initializeApp: Detected new invoice format with embedded appMapping/footer");
          storedAppMapping = decodedContent.appMapping;
          storedFooter = decodedContent.footer;
          decodedContent = decodedContent.msc;

          // If msc is still an object, stringify it
          if (typeof decodedContent === 'object') {
            decodedContent = JSON.stringify(decodedContent);
          }
        } else if (typeof decodedContent === 'object') {
          // Stringify objects that don't match new format
          decodedContent = JSON.stringify(decodedContent);
        }

        contentToLoad = decodedContent;
        templateId = fileData.templateId;
        footerIndex = fileData.billType || 1;

        // console.log("📄 initializeApp: File data loaded", {
        //   contentLength: contentToLoad.length,
        //   templateId: templateId,
        //   billType: footerIndex,
        //   hasStoredAppMapping: !!storedAppMapping,
        //   hasStoredFooter: !!storedFooter,
        // });

        // If we have stored appMapping/footer from the invoice, use those
        // Otherwise, fetch template data for appMapping and footers
        if (storedAppMapping) {
          // console.log("📋 initializeApp: Using stored appMapping from invoice");

          // Decode the MSC content if it's URL-encoded
          try {
            contentToLoad = decodeURIComponent(contentToLoad);
          } catch (e) {
            // Not encoded or already decoded
          }

          // Build a template data object from stored data
          // Need to create a minimal msc structure to avoid null reference in updateActiveTemplateData
          templateData = {
            appMapping: storedAppMapping,
            footers: storedFooter ? [storedFooter] : [],
            msc: { currentid: 'sheet1' } // Minimal msc to prevent null reference error
          };

          // Still try to fetch template for any missing footer data from local sources
          try {
            // Try user templates first
            let userTemplate = await localTemplateService.getUserTemplate(String(templateId));
            if (userTemplate && (!storedFooter || templateData.footers?.length === 0)) {
              templateData.footers = userTemplate.data.footers;
            }

            // If no footers found, try store template
            if (!templateData.footers?.length) {
              const numId = parseInt(String(templateId), 10);
              if (!isNaN(numId)) {
                const storeTemplate = await localTemplateService.fetchStoreTemplate(numId);
                if (storeTemplate) {
                  templateData.footers = storeTemplate.data.footers;
                }
              }
            }
          } catch (e) {
            console.log("⚠️ initializeApp: Could not fetch template for footers (non-critical)", e);
          }
        } else {
          // Old format: fetch template data for appMapping and footers
          // console.log("🔍 initializeApp: Fetching template data from local storage");

          try {
            // Try user templates first
            let userTemplate = await localTemplateService.getUserTemplate(String(templateId));
            if (userTemplate) {
              // console.log("✅ initializeApp: Template loaded from user templates");
              templateData = userTemplate.data;
            } else {
              // Try store templates
              const numId = parseInt(String(templateId), 10);
              if (!isNaN(numId)) {
                const storeTemplate = await localTemplateService.fetchStoreTemplate(numId);
                if (storeTemplate) {
                  console.log("✅ initializeApp: Template loaded from store templates");
                  templateData = storeTemplate.data;
                }
              }
            }
          } catch (e) {
            console.log("❌ initializeApp: Failed to fetch template", e);
          }

          if (!templateData) {
            console.log("❌ initializeApp: Template not found", { templateId });
            setTemplateNotFound(true);
            setFileNotFound(false);
            return;
          }
        }
      }

      // Ensure the active footer in templateData matches the loaded footerIndex
      if (templateData && templateData.footers) {
        templateData.footers = templateData.footers.map((f: any) => ({
          ...f,
          isActive: f.index === footerIndex
        }));
      }

      // Load template data into context
      // console.log("✅ initializeApp: Template found, loading template data");
      // console.log("📊 initializeApp: Template data", {
      //   templateId: templateId,
      //   footersCount: templateData.footers?.length,
      // });
      updateActiveTemplateData(templateData, templateId);

      // Initialize SocialCalc with the content
      // Log MSC content before loading
      try {
        const parsedMsc = JSON.parse(contentToLoad);
        console.log("📄 MSC BEFORE SOCIALCALC LOAD:", {
          hasEditableCells: !!parsedMsc.EditableCells,
          editableCellsCount: parsedMsc.EditableCells?.cells ? Object.keys(parsedMsc.EditableCells.cells).length : 0,
          editableCellsList: parsedMsc.EditableCells?.cells,
          numsheets: parsedMsc.numsheets,
          currentid: parsedMsc.currentid,
          fullMsc: parsedMsc
        });
      } catch (e) {
        console.log("📄 MSC (raw):", contentToLoad?.substring(0, 1000));
      }

      // Wait a bit to ensure DOM elements are ready
      setTimeout(() => {
        // console.log("⏰ initializeApp: Timeout callback executing");
        try {
          const currentControl = AppGeneral.getWorkbookInfo();
          // console.log("📋 initializeApp: Current control status", {
          //   hasControl: !!currentControl,
          //   hasWorkbook: !!(currentControl && currentControl.workbook),
          // });

          if (currentControl && currentControl.workbook) {
            // SocialCalc is initialized, use viewFile
            console.log(
              "✅ initializeApp: SocialCalc already initialized, using viewFile"
            );
            AppGeneral.viewFile(fileToLoad, contentToLoad);
          } else {
            // SocialCalc not initialized, initialize it first
            // console.log(
            //   "🔧 initializeApp: SocialCalc not initialized, initializing app"
            // );
            AppGeneral.initializeApp(contentToLoad);
          }
        } catch (error) {
          // console.error(
          //   "❌ initializeApp: Error in SocialCalc initialization",
          //   error
          // );
          // Fallback: try to initialize the app
          try {
            console.log("🔄 initializeApp: Attempting fallback initialization");
            AppGeneral.initializeApp(contentToLoad);
          } catch (initError) {
            console.error(
              "💥 initializeApp: Fallback initialization failed",
              initError
            );
            throw new Error(
              "Failed to load file: SocialCalc initialization error"
            );
          }
        }

        // Activate footer after initialization
        setTimeout(() => {
          // console.log("🦶 initializeApp: Activating footer", {
          //   billType: footerIndex,
          // });
          activateFooter(footerIndex);

          // Inject Invoice ID for new invoices
          if (isNewInvoiceMode) {
            const newInvoiceId = InvoiceGenerator.generateId();
            // console.log("🆔 initializeApp: Generated Invoice ID", newInvoiceId);

            // We need to set this in the proper cell for all sheets that have it mapped
            if (templateData && templateData.appMapping) {
              const socialCalc = (window as any).SocialCalc;
              if (socialCalc && socialCalc.GetCurrentWorkBookControl) {
                const workbookControl = socialCalc.GetCurrentWorkBookControl();
                if (!workbookControl.workbook) return;

                const currentSheetId = workbookControl.currentSheetButton.id;

                Object.keys(templateData.appMapping).forEach(sheetId => {
                  const mapping = templateData.appMapping[sheetId];
                  if (mapping.InvoiceNumber && mapping.InvoiceNumber.cell) {
                    const coord = mapping.InvoiceNumber.cell;

                    if (true) { // Treat all sheets the same
                      const sheetObj = workbookControl.workbook.sheetArr[sheetId];
                      if (sheetObj && sheetObj.sheet) {
                        const sheet = sheetObj.sheet;
                        const cell = sheet.GetAssuredCell(coord);
                        cell.datavalue = newInvoiceId;
                        cell.displaystring = newInvoiceId;
                        cell.valuetype = "t";

                        // If this was the active sheet, force a re-render of the editor
                        if (sheetId === currentSheetId) {
                          const editor = workbookControl.workbook.spreadsheet.editor;
                          if (editor) {
                            editor.EditorRenderSheet();
                          }
                        }
                      }
                    }
                  }
                });

                // Also increment the sequential number if used
                InvoiceGenerator.incrementSequentialNumber();
              }
            }
          }
        }, 500);
      }, 100);

      // console.log("✅ initializeApp: Successfully completed initialization");
      setFileNotFound(false);
      setTemplateNotFound(false);
    } catch (error) {
      console.error(
        "💥 initializeApp: Caught error during initialization",
        error
      );
      // On error, show file not found
      setFileNotFound(true);
      setTemplateNotFound(false);
    }
  };

  useEffect(() => {
    initializeApp();
  }, [fileName, location.search]); // Depend on fileName and query params for template mode

  // Resize handler to recalculate SocialCalc height on viewport changes
  useEffect(() => {
    const recalculateHeight = () => {
      const ele = document.getElementById("te_griddiv");
      const ionContent = document.querySelector("ion-content");
      if (ele && ionContent) {
        // Get the actual content area dimensions from IonContent
        const contentRect = ionContent.getBoundingClientRect();
        const availableHeight = contentRect.height;

        if (availableHeight > 0) {
          ele.style.height = availableHeight + "px";

          // Trigger SocialCalc resize
          const socialCalc = (window as any).SocialCalc;
          if (socialCalc && socialCalc.GetCurrentWorkBookControl) {
            const control = socialCalc.GetCurrentWorkBookControl();
            if (control?.workbook?.spreadsheet) {
              control.workbook.spreadsheet.DoOnResize();
            }
          }
        }
      }
    };

    // Initial calculation after a short delay to ensure layout is complete
    const initialTimer = setTimeout(recalculateHeight, 300);
    const secondTimer = setTimeout(recalculateHeight, 600);

    // Listen for resize events
    window.addEventListener('resize', recalculateHeight);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', recalculateHeight);
    }

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(secondTimer);
      window.removeEventListener('resize', recalculateHeight);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', recalculateHeight);
      }
    };
  }, [activeTemplateData]);

  // Initialize sheet change monitor
  useEffect(() => {
    if (fileName && activeTemplateData) {
      // Wait a bit for SocialCalc to be fully initialized
      const timer = setTimeout(() => {
        SheetChangeMonitor.initialize(updateCurrentSheetId);
      }, 1000);

      return () => {
        clearTimeout(timer);
        SheetChangeMonitor.cleanup();
      };
    }
  }, [fileName, activeTemplateData, updateCurrentSheetId]);

  useEffect(() => {
    if (fileName) {
      updateSelectedFile(fileName);
    }
  }, [fileName]);



  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    setTimeout(() => {
      handleSave(undefined, true);
    }, 1500);
  }, [autosaveCount]);

  useEffect(() => {
    // Add a delay to ensure SocialCalc is initialized before activating footer

    const timer = setTimeout(() => {
      activateFooter(billType);
    }, 1000);

    return () => clearTimeout(timer);
  }, [billType]);

  useEffect(() => {
    // Find the active footer index, default to 1 if none found
    const activeFooter = activeTemplateData?.footers?.find(
      (footer) => footer.isActive
    );
    const activeFooterIndex = activeFooter ? activeFooter.index : 1;
    updateBillType(activeFooterIndex);
  }, [activeTemplateData]);



  const footers = activeTemplateData ? activeTemplateData.footers : [];
  const footersList = footers.map((footerArray) => {
    const isActive = footerArray.index === billType;

    return (
      <IonButton
        key={footerArray.index}
        fill={isActive ? "solid" : "solid"}
        color={isActive ? "primary" : "light"}
        className="ion-no-margin footer-type-btn"
        style={{
          whiteSpace: "nowrap",
          minWidth: "max-content",
          marginRight: "8px",
          flexShrink: 0,
          borderRadius: "20px",
          "--padding-start": "16px",
          "--padding-end": "16px",
          fontWeight: isActive ? "600" : "500",
          fontSize: "13px",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        } as any}
        onClick={() => {
          updateBillType(footerArray.index);
          activateFooter(footerArray.index);
        }}
      >
        {footerArray.name}
      </IonButton>
    );
  });

  return (
    <IonPage
      className="invoice-page"
      style={{ height: "100%", maxHeight: "100vh", overflow: "hidden" }}
    >

      <IonHeader color="primary">

        {/* Updated padding-top to respect safe area for edge-to-edge display */}
        <IonToolbar color="primary" className="invoice-toolbar" style={{ paddingTop: `max(env(safe-area-inset-top, 0px), 24px)`, minHeight: '56px' }}>

          <IonButtons slot="start">
            <IonButton
              fill="clear"
              onClick={() => {
                // Redirect to Dashboard home
                window.location.href = "/app/dashboard";
              }}
              style={{ color: "white" }}
            >
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonButtons
            slot="start"
            className="editing-title"
            style={{ marginLeft: "8px" }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <span>{fileName === "invoice" ? "New Invoice" : fileName}</span>
            </div>
          </IonButtons>

          <IonButtons
            slot="end"
            className={isPlatform("desktop") && "ion-padding-end"}
          >
            <IonButton
              fill="clear"
              onClick={() => setShowCloudModal(true)}
              style={{ color: "white", marginRight: "12px", "--padding-start": "0", "--padding-end": "0", width: "24px", height: "24px" }}
              title="IPFS Cloud Manager"
            >
              <IonIcon icon={cloudOutline} style={{ fontSize: "24px" }} />
            </IonButton>
            <SaveIcon
              size={24}
              color="white"
              onClick={() => {
                // If it's a new invoice, prompt for name
                if (fileName === "invoice" || !isInvoiceSaved) {
                  const suggestedName = extractInvoiceIdFromSheet() || "";
                  setSaveInvoiceName(suggestedName);
                  setShowSaveInvoiceDialog(true);
                } else {
                  // Existing invoice, save directly
                  handleSaveClick();
                }
              }}
              style={{ cursor: "pointer", marginRight: "12px" }}
              title="Save"
            />
            <ShareIcon
              size={24}
              color="white"
              onClick={(e) => {
                setShowMenu(true);
              }}
              style={{ cursor: "pointer", marginRight: "12px" }}
            />
            <MoreIcon
              id="actions-trigger"
              size={24}
              color="white"
              onClick={() => setShowActionsPopover(true)}
              style={{ cursor: "pointer", marginRight: "2px" }}
              title="More Actions"
            />
          </IonButtons>
        </IonToolbar>

        <IonToolbar color="secondary" style={{ "--min-height": "56px", "--padding-top": "0", "--padding-bottom": "0" } as any}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              overflowX: "auto",
              padding: "8px 16px",
              width: "100%",
              alignItems: "center",
            }}
          >
            {footersList}
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent
        scrollY={false}
        style={{
          overflow: "hidden",
          "--padding-bottom": "0px",
          "--padding-top": "0px",
        } as any}
      >
        {fileNotFound ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <IonIcon
              icon={documentText}
              style={{
                fontSize: "80px",
                color: "var(--ion-color-medium)",
                marginBottom: "20px",
              }}
            />
            <h2
              style={{
                margin: "0 0 16px 0",
                color: "var(--ion-color-dark)",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              File Not Found
            </h2>
            <p
              style={{
                margin: "0 0 30px 0",
                color: "var(--ion-color-medium)",
                fontSize: "16px",
                lineHeight: "1.5",
                maxWidth: "400px",
              }}
            >
              {selectedFile
                ? `The file "${selectedFile}" doesn't exist in your storage.`
                : "The requested file couldn't be found."}
            </p>
            <IonButton
              fill="solid"
              size="default"
              onClick={() => history.push("/app/files")}
              style={{ minWidth: "200px" }}
            >
              <IonIcon icon={folder} slot="start" />
              Go to File Explorer
            </IonButton>
          </div>
        ) : templateNotFound ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "40px 20px",
              textAlign: "center",
            }}
          >
            <IonIcon
              icon={downloadOutline}
              style={{
                fontSize: "80px",
                color: "var(--ion-color-medium)",
                marginBottom: "20px",
              }}
            />
            <h2
              style={{
                margin: "0 0 16px 0",
                color: "var(--ion-color-dark)",
                fontSize: "24px",
                fontWeight: "600",
              }}
            >
              Template Not Available
            </h2>
            <p
              style={{
                margin: "0 0 30px 0",
                color: "var(--ion-color-medium)",
                fontSize: "16px",
                lineHeight: "1.5",
                maxWidth: "400px",
              }}
            >
              The template you are trying to load is not available in your account.
              Please create a new template or select a different one.
            </p>
            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <IonButton
                fill="solid"
                size="default"
                onClick={() => history.push("/app/dashboard/templates")}
                style={{ minWidth: "160px" }}
              >
                <IonIcon icon={folder} slot="start" />
                Select Template
              </IonButton>
              <IonButton
                fill="outline"
                size="default"
                onClick={() => history.push("/app/dashboard/templates")}
                style={{ minWidth: "160px" }}
              >
                <IonIcon icon={add} slot="start" />
                Create New
              </IonButton>
            </div>
          </div>
        ) : (
          <>
            <div id="container">

              <div id="workbookControl"></div>
              <div id="tableeditor"></div>
              <div id="msg"></div>
            </div>

            {/* Edit FAB Button Removed - Moved to IonPage level */}
          </>
        )}

        {/* Toast for save notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="bottom"
        />

        {/* Save As Dialog */}
        <IonAlert
          isOpen={showSaveAsDialog}
          onDidDismiss={() => {
            setShowSaveAsDialog(false);
            setSaveAsFileName("");
            setSaveAsOperation(null);
          }}
          onDidPresent={() => {
            // Disable SocialCalc keyboard handling when dialog is open
            const socialCalc = (window as any).SocialCalc;
            if (socialCalc) {
              socialCalc.keyboardEnabled = false;
            }
          }}
          onWillDismiss={() => {
            // Re-enable SocialCalc keyboard handling when dialog closes
            const socialCalc = (window as any).SocialCalc;
            if (socialCalc) {
              socialCalc.keyboardEnabled = true;
            }
          }}
          backdropDismiss={false}
          keyboardClose={false}
          header="Save As - Local Storage"
          message="Enter a filename for your invoice:"
          inputs={[
            {
              name: "filename",
              type: "text",
              placeholder: "Enter filename...",
              value: saveAsFileName,
              attributes: {
                maxlength: 50,
                onKeyDown: (e: any) => e.stopPropagation(),
                onKeyUp: (e: any) => e.stopPropagation(),
                onKeyPress: (e: any) => e.stopPropagation(),
              },
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setSaveAsFileName("");
                setSaveAsOperation(null);
              },
            },
            {
              text: "Save",
              handler: (data) => {
                if (data.filename && data.filename.trim()) {
                  setSaveAsFileName(data.filename.trim());
                  // Close dialog and execute save
                  setShowSaveAsDialog(false);
                  // Use setTimeout to ensure state updates
                  setTimeout(async () => {
                    await executeSaveAsWithFilename(data.filename.trim());
                  }, 100);
                } else {
                  setToastMessage("Please enter a valid filename");
                  setToastColor("warning");
                  setShowToast(true);
                  return false; // Prevent dialog from closing
                }
              },
            },
          ]}
        />

        {/* File Options Popover */}
        <FileOptions
          showActionsPopover={showActionsPopover}
          setShowActionsPopover={setShowActionsPopover}
          showColorModal={showColorModal}
          setShowColorPicker={setShowColorModal}
          fileName={fileName}
          onSaveToIpfs={handleSaveToIpfs}
        />

        {/* Color Picker Modal */}
        <IonModal
          isOpen={showColorModal}
          onDidDismiss={() => {
            setShowColorModal(false);
            setCustomColorInput("");
          }}
          className="color-picker-modal rounded-modal shadow-modal"
          backdropDismiss={true}
        >
          <div className="color-picker-content">
            <div className="color-picker-header">
              <h2 className="color-picker-title">Sheet Colors</h2>
              <IonButton
                fill="clear"
                size="small"
                className="color-picker-close-btn"
                onClick={() => setShowColorModal(false)}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <IonSegment
              value={colorMode}
              onIonChange={(e) =>
                setColorMode(e.detail.value as "background" | "font")
              }
            >
              <IonSegmentButton value="background">
                <IonLabel>Background</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="font">
                <IonLabel>Font Color</IonLabel>
              </IonSegmentButton>
            </IonSegment>

            <div className="color-grid">
              {availableColors.map((color) => (
                <div key={color.name} className="color-grid-item" onClick={() => handleColorChange(color.name)}>
                  <div
                    className={`color-circle ${((colorMode === "background" && activeBackgroundColor === color.color) ||
                      (colorMode === "font" && activeFontColor === color.color))
                      ? 'active'
                      : ''}`}
                    style={{ backgroundColor: color.color }}
                  />
                  <span className="color-circle-label">{color.label}</span>
                </div>
              ))}
            </div>


          </div>
        </IonModal>


        {/* IPFS Pinning Result Alert */}
        <IonAlert
          isOpen={showIpfsAlert}
          onDidDismiss={() => {
            setShowIpfsAlert(false);
            setIpfsCid("");
            setIpfsStatus("idle");
            setIpfsErrorMsg("");
          }}
          header={ipfsStatus === "success" ? "Saved to IPFS Successfully!" : "IPFS Upload Failed"}
          message={
            ipfsStatus === "success"
              ? `Your invoice has been securely pinned to the decentralized IPFS network.\n\nCID:\n${ipfsCid}\n\nThe CID has been copied to your clipboard. You can share this CID with anyone to retrieve this invoice.`
              : `There was an error saving your invoice to IPFS:\n\n${ipfsErrorMsg}`
          }
          buttons={[
            {
              text: ipfsStatus === "success" ? "Copy CID Again" : "Cancel",
              handler: () => {
                if (ipfsStatus === "success") {
                  navigator.clipboard.writeText(ipfsCid);
                  setToastMessage("CID copied to clipboard!");
                  setToastColor("success");
                  setShowToast(true);
                }
              }
            },
            {
              text: "OK",
              role: "cancel"
            }
          ]}
        />

        {/* Save Invoice Dialog */}
        <IonAlert
          isOpen={showSaveInvoiceDialog}
          onDidDismiss={() => {
            setShowSaveInvoiceDialog(false);
            setSaveInvoiceName("");
          }}
          onDidPresent={() => {
            // Disable SocialCalc keyboard handling when dialog is open
            const socialCalc = (window as any).SocialCalc;
            if (socialCalc) {
              socialCalc.keyboardEnabled = false;
            }
          }}
          onWillDismiss={() => {
            // Re-enable SocialCalc keyboard handling when dialog closes
            const socialCalc = (window as any).SocialCalc;
            if (socialCalc) {
              socialCalc.keyboardEnabled = true;
            }
          }}
          backdropDismiss={false}
          keyboardClose={false}
          header="Save Invoice"
          message="Enter a name for your invoice:"
          inputs={[
            {
              name: "invoiceName",
              type: "text",
              placeholder: "Invoice name...",
              value: saveInvoiceName,
              attributes: {
                maxlength: 50,
                onKeyDown: (e: any) => e.stopPropagation(),
                onKeyUp: (e: any) => e.stopPropagation(),
                onKeyPress: (e: any) => e.stopPropagation(),
              },
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setSaveInvoiceName("");
              },
            },
            {
              text: "Save",
              handler: (data) => {
                if (data.invoiceName && data.invoiceName.trim()) {
                  const invoiceName = data.invoiceName.trim();

                  (async () => {
                    // If this is a new invoice (placeholder), update filename and navigate
                    if (fileName === "invoice") {
                      // Generate a filename from invoice name
                      const filename = invoiceName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-');

                      try {
                        const exists = await localTemplateService.invoiceExists(filename);
                        if (exists) {
                          setToastMessage(`Invoice "${invoiceName}" already exists. Please choose a different name.`);
                          setToastColor("danger");
                          setShowToast(true);
                          return;
                        }
                      } catch (e) {
                        console.error("Error checking invoice existence", e);
                      }

                      setSaveInvoiceName(invoiceName);
                      setShowSaveInvoiceDialog(false);

                      updateSelectedFile(filename);

                      try {
                        // Get the spreadsheet content
                        const socialCalc = (window as any).SocialCalc;
                        if (socialCalc && socialCalc.GetCurrentWorkBookControl) {
                          const control = socialCalc.GetCurrentWorkBookControl();

                          // UPDATE INVOICE ID IN CELLS
                          if (activeTemplateData && activeTemplateData.appMapping) {
                            try {
                              Object.keys(activeTemplateData.appMapping).forEach(sheetId => {
                                const mapping = activeTemplateData.appMapping[sheetId];
                                if (mapping.InvoiceNumber && mapping.InvoiceNumber.cell) {
                                  const coord = mapping.InvoiceNumber.cell;
                                  if (control.workbook && control.workbook.sheetArr && control.workbook.sheetArr[sheetId]) {
                                    const sheetObj = control.workbook.sheetArr[sheetId];
                                    if (sheetObj && sheetObj.sheet) {
                                      const sheet = sheetObj.sheet;
                                      // Using GetAssuredCell ensures the cell object exists
                                      const cell = sheet.GetAssuredCell(coord);
                                      cell.datavalue = invoiceName;
                                      cell.displaystring = invoiceName;
                                      cell.valuetype = "t";

                                      // If this is the active sheet, render it to reflect changes immediately
                                      if (sheetId === control.currentSheetButton.id) {
                                        if (control.workbook.spreadsheet && control.workbook.spreadsheet.editor) {
                                          control.workbook.spreadsheet.editor.EditorRenderSheet();
                                        }
                                      }
                                    }
                                  }
                                }
                              });
                            } catch (e) {
                              console.error("Failed to update invoice ID in cells", e);
                            }
                          }

                          // Get the current sheet ID and sheet object
                          const currentSheetId = control.currentSheetButton?.id || 'sheet1';
                          const currentSheet = control.workbook?.sheetArr?.[currentSheetId]?.sheet;

                          const content = encodeURIComponent(AppGeneral.getSpreadsheetContent());

                          // Helper to parse currency values
                          const parseCurrency = (val: string | number): number | null => {
                            if (typeof val === 'number') return val;
                            if (!val) return null;
                            const clean = String(val).replace(/[^0-9.-]+/g, "");
                            const num = parseFloat(clean);
                            return isNaN(num) ? null : num;
                          };

                          // Extract total from mapped cell
                          let totalValue: number | null = null;
                          if (currentSheet && activeTemplateData?.appMapping) {
                            const sheetMapping = activeTemplateData.appMapping[currentSheetId];
                            const totalItem = sheetMapping?.['Total'] || sheetMapping?.['Grand Total'] || sheetMapping?.['total'];
                            if (totalItem?.cell && currentSheet.cells?.[totalItem.cell]) {
                              const cell = currentSheet.cells[totalItem.cell];
                              totalValue = parseCurrency(cell.datavalue) ?? parseCurrency(cell.displaystring);
                            }
                          }

                          // Extract Bill To details
                          let billToDetails: any = null;
                          if (currentSheet && activeTemplateData?.appMapping) {
                            const sheetMapping = activeTemplateData.appMapping[currentSheetId];
                            if (sheetMapping?.BillTo?.formContent) {
                              billToDetails = {};
                              for (const [key, field] of Object.entries(sheetMapping.BillTo.formContent)) {
                                const cellRef = (field as any).cell;
                                if (cellRef && currentSheet.cells?.[cellRef]) {
                                  let val = currentSheet.cells[cellRef].datavalue;
                                  if (val === undefined || val === null) {
                                    val = currentSheet.cells[cellRef].displaystring;
                                  }
                                  billToDetails[key] = val || "";
                                }
                              }
                            }
                          }

                          // Save to local storage with full metadata
                          await localTemplateService.saveInvoice({
                            id: filename,
                            name: invoiceName,
                            templateId: activeTemplateId || billType,
                            content: content,
                            billType: billType,
                            total: totalValue || 0,
                            billToDetails: billToDetails
                          });

                          setIsInvoiceSaved(true);
                          setCurrentInvoiceId(filename);
                          setToastMessage(`Invoice "${invoiceName}" saved successfully!`);
                          setToastColor("success");
                          setShowToast(true);

                          // Navigate to the new invoice URL using direct page load
                          window.location.href = `/app/editor/${filename}`;
                        }
                      } catch (error) {
                        console.error("Failed to save invoice:", error);
                        setToastMessage("Failed to save invoice. Please try again.");
                        setToastColor("danger");
                        setShowToast(true);
                      }
                    } else {
                      setSaveInvoiceName(invoiceName);
                      setShowSaveInvoiceDialog(false);

                      // Existing invoice, just update with new name
                      await handleSave(invoiceName);
                      setToastMessage(`Invoice saved successfully!`);
                      setToastColor("success");
                      setShowToast(true);
                    }
                  })();
                  return false;
                } else {
                  setToastMessage("Please enter a valid invoice name");
                  setToastColor("warning");
                  setShowToast(true);
                  return false; // Prevent dialog from closing
                }
              },
            },
          ]}
        />

        <Menu
          showM={showMenu}
          setM={() => setShowMenu(false)}
          invoiceId={extractInvoiceIdFromSheet()}
        />


        {/* Custom Edit Floating Button */}
        {/* Animated FAB Menu */}
        {/* Invoice Sidebar */}
        <InvoiceSidebar
          isOpen={showSidebar}
          onClose={() => setShowSidebar(false)}
          onApplyAddress={handleApplyAddress}
          onApplyInventory={handleApplyInventory}
          onApplyLogo={handleSelectLogo}
          onApplySignature={handleSelectSignature}
          side="end"
        />

        {/* Edit FAB Button */}
        {!fileNotFound && !templateNotFound && (
          // Increased bottom gap from 16px to 40px to avoid being too close to the edge/corner
          <div style={{ position: 'fixed', bottom: 'max(40px, env(safe-area-inset-bottom, 0px))', right: 'max(16px, env(safe-area-inset-right, 0px))', zIndex: 1 }}>
            <button
              className="fab-main-button"
              onClick={() => setShowSidebar(true)}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--ion-color-primary)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              }}
            >
              <CustomEditIcon />
            </button>
          </div>
        )}

        {/* Cell Edit Modal */}
        <CellEditModal
          isOpen={showCellEditModal}
          onClose={() => {
            setShowCellEditModal(false);
            if (cellEditData?.cleanup) {
              cellEditData.cleanup();
            }
            setCellEditData(null);
          }}
          cellData={cellEditData}
        />

        {/* IPFS Cloud Modal */}
        <IpfsCloudModal
          isOpen={showCloudModal}
          onClose={() => setShowCloudModal(false)}
          onImportSuccess={handleCloudImportSuccess}
        />

      </IonContent>


    </IonPage>
  );
};

export default InvoicePage;
