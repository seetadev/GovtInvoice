import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Local } from "../components/Storage/LocalStorage";
import { TemplateData } from "../types/template";

interface InvoiceContextType {
  selectedFile: string;
  billType: number;
  store: Local;
  activeTemplateData: TemplateData | null;
  activeTemplateId: number | string | null;
  currentSheetId: string | null;
  updateSelectedFile: (fileName: string) => void;
  updateBillType: (type: number) => void;
  updateActiveTemplateData: (templateData: TemplateData | null, templateId?: number | string) => void;
  updateCurrentSheetId: (sheetId: string) => void;
  resetToDefaults: () => void;
  currency: string;
  updateCurrency: (currency: string) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
};

interface InvoiceProviderProps {
  children: ReactNode;
}

export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({
  children,
}) => {
  const [selectedFile, setSelectedFile] = useState<string>("file_not_found");
  const [billType, setBillType] = useState<number>(1);
  const [activeTemplateData, setActiveTemplateData] =
    useState<TemplateData | null>(null);
  const [activeTemplateId, setActiveTemplateId] = useState<number | string | null>(null);
  const [currentSheetId, setCurrentSheetId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("INR");
  const [store] = useState(() => new Local());

  // Load persisted state from localStorage on mount
  useEffect(() => {
    try {
      const savedFile = localStorage.getItem("stark-invoice-selected-file");
      const savedBillType = localStorage.getItem("stark-invoice-bill-type");
      const savedActiveTemplateId = localStorage.getItem(
        "stark-invoice-active-template-id"
      );
      const savedCurrentSheetId = localStorage.getItem(
        "stark-invoice-current-sheet-id"
      );

      // Load currency from settings storage or default
      const savedSettings = localStorage.getItem("app_settings");
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.defaultCurrency) {
          setCurrency(parsed.defaultCurrency);
        }
      }

      if (savedFile) {
        setSelectedFile(savedFile);
      }

      if (savedBillType) {
        setBillType(parseInt(savedBillType, 10));
      }

      if (savedActiveTemplateId) {
        // For string IDs (filenames) or numbers
        const templateId = isNaN(Number(savedActiveTemplateId)) ? savedActiveTemplateId : Number(savedActiveTemplateId);
        setActiveTemplateId(templateId);
        // Note: Template data is no longer synchronously loaded from local DATA.
        // Components must fetch data if needed based on activeTemplateId.
      }

      if (savedCurrentSheetId) {
        setCurrentSheetId(savedCurrentSheetId);
      }
    } catch (error) {
      // Failed to load invoice state from localStorage
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("stark-invoice-selected-file", selectedFile);
    } catch (error) {
      // Failed to save selected file to localStorage
    }
  }, [selectedFile]);

  useEffect(() => {
    try {
      localStorage.setItem("stark-invoice-bill-type", billType.toString());
    } catch (error) {
      // Failed to save bill type to localStorage
    }
  }, [billType]);

  useEffect(() => {
    try {
      if (activeTemplateId) {
        localStorage.setItem(
          "stark-invoice-active-template-id",
          activeTemplateId.toString()
        );
      } else {
        localStorage.removeItem("stark-invoice-active-template-id");
      }
    } catch (error) {
      // Failed to save active template id to localStorage
    }
  }, [activeTemplateId]);

  useEffect(() => {
    try {
      if (currentSheetId) {
        localStorage.setItem("stark-invoice-current-sheet-id", currentSheetId);
      } else {
        localStorage.removeItem("stark-invoice-current-sheet-id");
      }
    } catch (error) {
      // Failed to save current sheet id to localStorage
    }
  }, [currentSheetId]);

  const updateSelectedFile = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const updateBillType = (type: number) => {
    setBillType(type);
  };

  const updateActiveTemplateData = (templateData: TemplateData | null, templateId?: number | string) => {
    setActiveTemplateData(templateData);
    if (templateId) setActiveTemplateId(templateId);
    // Automatically update current sheet ID when template changes
    if (templateData && templateData.msc.currentid) {
      setCurrentSheetId(templateData.msc.currentid);
    }
  };

  const updateCurrentSheetId = (sheetId: string) => {
    setCurrentSheetId(sheetId);
  };

  const updateCurrency = (newCurrency: string) => {
    setCurrency(newCurrency);
    // We also update the app_settings in localStorage to stay in sync with legacy settings utils if needed,
    // but primarily we drive from context now.
    try {
      const stored = localStorage.getItem("app_settings");
      const settings = stored ? JSON.parse(stored) : { autoSaveEnabled: false };
      settings.defaultCurrency = newCurrency;
      localStorage.setItem("app_settings", JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to persist currency setting", e);
    }
  };

  const resetToDefaults = () => {
    setSelectedFile("File_Not_found");
    setBillType(1);
    setActiveTemplateData(null);
    setActiveTemplateId(null);
    setCurrentSheetId(null);
  };

  const value: InvoiceContextType = {
    selectedFile,
    billType,
    store,
    activeTemplateData,
    activeTemplateId,
    currentSheetId,
    currency,
    updateSelectedFile,
    updateBillType,
    updateActiveTemplateData,
    updateCurrentSheetId,
    updateCurrency,
    resetToDefaults,
  };

  return (
    <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>
  );
};
