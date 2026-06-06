import React, { useState, useEffect } from "react";
import "./Files.css";
import * as AppGeneral from "../InvoicePage/socialcalc/index.js";
import {
  IonIcon,
  IonAlert,
  IonToast,
  IonSearchbar,
  IonButton,
  IonSelect,
  IonSelectOption,
  isPlatform,
  useIonRouter,
} from "@ionic/react";
import {
  trash,
  documentText,
  swapVertical,
  create,
  add,
  cloudDownloadOutline,
  cloudUploadOutline,
} from "ionicons/icons";
import { ipfsService } from "../../services/ipfs-service";

// import { useHistory } from "react-router-dom";
import { useInvoice } from "../../contexts/InvoiceContext";
import {
  isQuotaExceededError,
  getQuotaExceededMessage,
} from "../../utils/helper";
import { localTemplateService } from "../../services/local-template-service";
import EmptyInvoicesIcon from "../Icons/EmptyInvoicesIcon";

const Files: React.FC<{
  file: string;
  updateSelectedFile: Function;
  updateBillType: Function;
  onDataChange?: () => void;
}> = (props) => {
  const {
    selectedFile,
    updateSelectedFile,
    currency,
  } = useInvoice();

  const userId = 'offline_user';
  const router = useIonRouter();

  const [showAlert1, setShowAlert1] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  const [showRenameAlert, setShowRenameAlert] = useState(false);
  const [renameFileName, setRenameFileName] = useState("");
  const [currentRenameKey, setCurrentRenameKey] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // const [fileSource, setFileSource] = useState<"local" | "cloud">("cloud");
  const [searchQuery, setSearchQuery] = useState("");

  // IPFS Import & Pin states
  const [showIpfsImportAlert, setShowIpfsImportAlert] = useState(false);
  const [ipfsImporting, setIpfsImporting] = useState(false);
  const [showDirectIpfsAlert, setShowDirectIpfsAlert] = useState(false);
  const [directCid, setDirectCid] = useState("");
  const [directInvoiceName, setDirectInvoiceName] = useState("");
  const [sortBy, setSortBy] = useState<
    "name" | "date" | "dateCreated" | "dateModified"
  >("dateModified");
  const [fileListContent, setFileListContent] = useState<React.ReactNode>(null);




  // Screen size state
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Blockchain state removed - local-only mode

  const [templates, setTemplates] = useState<any[]>([]);

  const [createLink, setCreateLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadTemplatesAndLink = async () => {
      try {
        // Load store templates (metadata only)
        const storeTemplates = await localTemplateService.fetchStoreTemplates(1, 100);
        // Load user templates
        const userTemplates = await localTemplateService.getUserTemplates();

        // Combine them
        const allTemplates = [...storeTemplates.items, ...userTemplates];

        // Deduplicate by ID
        const seen = new Set();
        const unique = allTemplates.filter(t => {
          const id = t.id;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setTemplates(unique);

        // Calculate Create Link
        let templateId = await localTemplateService.getActiveTemplateId();
        if (!templateId) {
          if (storeTemplates.items.length > 0) {
            const mobile = storeTemplates.items.find((t: any) => t.device === 'mobile');
            const tablet = storeTemplates.items.find((t: any) => t.device === 'tablet');

            if (isPlatform('mobile') && !isPlatform('tablet') && !isPlatform('ipad') && mobile) {
              templateId = mobile.id;
            } else if ((isPlatform('tablet') || isPlatform('ipad')) && tablet) {
              templateId = tablet.id;
            } else {
              templateId = storeTemplates.items[0].id;
            }
          }
        }

        if (templateId) {
          setCreateLink(`/app/editor/invoice?template=${templateId}`);
        }
      } catch (e) {
        console.error("Error loading templates in Files:", e);
      }
    };
    loadTemplatesAndLink();
  }, []);

  // Template helper functions
  const getAvailableTemplates = () => {
    // map templates.template_id and templates.tempate_name with templateId and template resp
    return templates.map((template) => ({
      templateId: template.id,
      template: template.name,
      ImageUri: template.image,
    }));
  };



  const getTemplateInfo = (templateId: number) => {
    const meta = templates.find(t => (t.id === templateId));
    return meta ? meta.name : `Template ${templateId}`;
  };

  // Edit local file
  const editFile = (key: string) => {
    router.push(`/app/editor/${key}`, 'forward', 'push');
  };

  const handleCreateInvoice = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      // Check 8-file limit
      const canCreate = await localTemplateService.canCreateInvoice();
      if (!canCreate) {
        setToastMessage(`File limit reached (max ${localTemplateService.maxInvoices}). Please delete some invoices first.`);
        setShowToast(true);
        return;
      }

      // Use existing createLink if available for immediate navigation
      if (createLink) {
        router.push(createLink, 'forward', 'push');
        return;
      }

      // Otherwise, determine template dynamically
      let templateId: number | string | null = null;
      const storeTemplates = await localTemplateService.fetchStoreTemplates(1, 100);

      if (storeTemplates.items.length > 0) {
        const mobile = storeTemplates.items.find((t: any) => t.device === 'mobile');
        const tablet = storeTemplates.items.find((t: any) => t.device === 'tablet');

        const isTabletDevice = isPlatform('tablet') || isPlatform('ipad') || (window.innerWidth >= 768);

        if (isTabletDevice && tablet) {
          templateId = tablet.id;
        } else if (mobile) {
          templateId = mobile.id;
        } else {
          templateId = storeTemplates.items[0].id; // Fallback
        }
      }

      if (templateId) {
        await localTemplateService.setActiveTemplateId(templateId);
        router.push(`/app/editor/invoice?template=${templateId}`, 'forward', 'push');
      } else {
        console.error('No suitable template found');
        setToastMessage("No templates available. Please check your internet connection.");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      setToastMessage("Failed to create invoice");
      setShowToast(true);
    } finally {
      setIsCreating(false);
    }
  };

  // Delete file
  const deleteFile = (key: string) => {
    setShowAlert1(true);
    setCurrentKey(key);
  };

  // Format date with validation
  const _formatDate = (date: string) => {
    if (!date) return "Unknown date";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }
    return parsedDate.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get appropriate date label and value based on sort option for local files
  const getLocalFileDateInfo = (file: any) => {
    const parseDate = (dateValue: any) => {
      if (!dateValue) return null;

      // If it's already a valid date string (ISO format)
      if (
        typeof dateValue === "string" &&
        !isNaN(new Date(dateValue).getTime())
      ) {
        return dateValue;
      }

      // If it's a Date.toString() format, parse it
      if (typeof dateValue === "string" && dateValue.includes("GMT")) {
        const parsed = new Date(dateValue);
        return !isNaN(parsed.getTime()) ? parsed.toISOString() : null;
      }

      return null;
    };

    if (sortBy === "dateCreated") {
      const createdDate =
        parseDate(file.dateCreated) ||
        parseDate(file.date) ||
        parseDate(file.dateModified);
      return {
        label: "Created",
        value: createdDate || new Date().toISOString(),
      };
    } else if (sortBy === "dateModified") {
      const modifiedDate = parseDate(file.dateModified) || parseDate(file.date);
      return {
        label: "Modified",
        value: modifiedDate || new Date().toISOString(),
      };
    } else {
      const modifiedDate = parseDate(file.date) || parseDate(file.dateModified);
      return {
        label: "Modified",
        value: modifiedDate || new Date().toISOString(),
      };
    }
  };

  // Sort files based on selected criteria
  const sortFiles = (
    files: any[],
    sortCriteria: "name" | "date" | "dateCreated" | "dateModified"
  ) => {
    const sortedFiles = [...files];

    switch (sortCriteria) {
      case "name":
        return sortedFiles.sort((a, b) => {
          const nameA = (a.name || a.filename || "").toLowerCase();
          const nameB = (b.name || b.filename || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
      case "date":
        return sortedFiles.sort((a, b) => {
          const dateA = new Date(a.date || a.created_at || 0).getTime();
          const dateB = new Date(b.date || b.created_at || 0).getTime();
          return dateB - dateA; // Most recent first
        });
      case "dateCreated":
        return sortedFiles.sort((a, b) => {
          const dateA = new Date(
            a.dateCreated || a.date || a.dateModified || 0
          ).getTime();
          const dateB = new Date(
            b.dateCreated || b.date || b.dateModified || 0
          ).getTime();
          // Handle invalid dates by treating them as very old dates (0)
          const validDateA = isNaN(dateA) ? 0 : dateA;
          const validDateB = isNaN(dateB) ? 0 : dateB;
          return validDateB - validDateA; // Most recent first
        });
      case "dateModified":
        return sortedFiles.sort((a, b) => {
          const dateA = new Date(a.dateModified || a.date || 0).getTime();
          const dateB = new Date(b.dateModified || b.date || 0).getTime();
          // Handle invalid dates by treating them as very old dates (0)
          const validDateA = isNaN(dateA) ? 0 : dateA;
          const validDateB = isNaN(dateB) ? 0 : dateB;
          return validDateB - validDateA; // Most recent first
        });
      default:
        return sortedFiles;
    }
  };

  // Group files by date
  const groupFilesByDate = (
    files: any[],
    sortCriteria?: "name" | "date" | "dateCreated" | "dateModified"
  ) => {
    const groups: { [key: string]: any[] } = {};
    files.forEach((file) => {
      let dateForGrouping;

      if (sortCriteria === "dateCreated") {
        const createdDate = file.dateCreated || file.date || file.dateModified;
        dateForGrouping = new Date(createdDate);
        // Fallback to a valid date if the created date is invalid
        if (isNaN(dateForGrouping.getTime())) {
          dateForGrouping = new Date(
            file.dateModified || file.date || Date.now()
          );
        }
      } else if (sortCriteria === "dateModified") {
        const modifiedDate = file.dateModified || file.date;
        dateForGrouping = new Date(modifiedDate);
        // Fallback to a valid date if the modified date is invalid
        if (isNaN(dateForGrouping.getTime())) {
          dateForGrouping = new Date(file.date || Date.now());
        }
      } else {
        dateForGrouping = new Date(file.date || file.created_at);
        // Fallback to current date if invalid
        if (isNaN(dateForGrouping.getTime())) {
          dateForGrouping = new Date();
        }
      }

      const dateHeader = dateForGrouping.toDateString();
      if (!groups[dateHeader]) groups[dateHeader] = [];
      groups[dateHeader].push(file);
    });
    return groups;
  };

  // Filter files by search
  const filterFilesBySearch = (files: any[], query: string) => {
    if (!query.trim()) return files;
    const searchTerm = query.toLowerCase().trim();
    return files.filter((file) => {
      const meta = getInvoiceMetadata(file);

      const fileName =
        file.name?.toLowerCase() ||
        file.file_name?.toLowerCase() ||
        file.key?.toLowerCase() ||
        file.filename?.toLowerCase() ||
        "";

      const customerName = String(meta.customer || '').toLowerCase();
      const customerPhone = String(meta.phone || '').toLowerCase();
      const invoiceId = String(meta.invoiceId || '').toLowerCase();

      return (
        fileName.includes(searchTerm) ||
        customerName.includes(searchTerm) ||
        customerPhone.includes(searchTerm) ||
        invoiceId.includes(searchTerm)
      );
    });
  };

  // Validation function (adapted from Menu.tsx)
  const _validateName = async (filename: string, excludeKey?: string) => {
    filename = filename.trim();
    if (filename === "Untitled") {
      setToastMessage(
        "Cannot update Untitled file! Use Save As Button to save."
      );
      return false;
    } else if (filename === "" || !filename) {
      setToastMessage("Filename cannot be empty");
      return false;
    } else if (filename.length > 30) {
      setToastMessage("Filename too long");
      return false;
    } else if (/^[a-zA-Z0-9- ]*$/.test(filename) === false) {
      setToastMessage("Special Characters cannot be used");
      return false;
    } else {
      // Local check
      const exists = await localTemplateService.invoiceExists(filename);
      if (exists && filename !== excludeKey) {
        setToastMessage("Filename already exists");
        return false;
      }
    }
    return true;
  };

  // Rename file function
  const renameFile = (key: string) => {
    setCurrentRenameKey(key);
    setRenameFileName(key);
    setShowRenameAlert(true);
  };

  // Handle rename confirmation
  const handleRename = async (newFileName: string) => {
    if (!currentRenameKey) return;

    // If the new filename is the same as the current one, just close the dialog
    if (newFileName === currentRenameKey) {
      setToastMessage("File name unchanged");
      setShowToast(true);
      setCurrentRenameKey(null);
      setRenameFileName("");
      setShowRenameAlert(false);
      return;
    }

    if (await _validateName(newFileName, currentRenameKey)) {
      try {
        // Local logic
        const fileData = await localTemplateService.getInvoice(currentRenameKey);
        if (fileData) {
          // Save new file (create new entry)
          await localTemplateService.saveInvoice({
            ...fileData,
            id: newFileName,
            name: newFileName,
          });

          // Delete old file
          await localTemplateService.deleteInvoice(currentRenameKey);
        }

        // Update selected file if it was the renamed file
        if (selectedFile === currentRenameKey) {
          updateSelectedFile(newFileName);
        }

        setToastMessage(`File renamed to "${newFileName}"`);
        setShowToast(true);

        // Refresh the file list
        await renderFileList();

        // Reset state
        setCurrentRenameKey(null);
        setRenameFileName("");
        setShowRenameAlert(false);
      } catch (error) {
        // Check if the error is due to storage quota exceeded
        if (isQuotaExceededError(error)) {
          setToastMessage(getQuotaExceededMessage("renaming files"));
        } else {
          setToastMessage("Failed to rename file");
        }
        setShowToast(true);
        // Reset state even on error to close the dialog
        setCurrentRenameKey(null);
        setRenameFileName("");
        setShowRenameAlert(false);
      }
    } else {
      // Validation failed - show the error toast but keep the dialog open
      // The validation function already shows the error toast
      setShowToast(true);
      // Don't close the dialog here - let the user see the error and try again
    }
  };

  // Helper to extract metadata (moved to component scope for search filtering)
  const getInvoiceMetadata = (file: any) => {
    let customerName = '-';
    let invoiceNumber = file.invoiceNumber || file.invoiceId || file.name || '';
    let amount = file.total || 0;

    // Use invoiceDate from metadata if available
    let date: string;
    if (file.invoiceDate) {
      const parsedDate = new Date(file.invoiceDate);
      if (!isNaN(parsedDate.getTime())) {
        date = _formatDate(parsedDate.toISOString());
      } else {
        date = file.invoiceDate;
      }
    } else {
      date = _formatDate(getLocalFileDateInfo(file).value);
    }

    let status = 'Draft';

    // Extract customer name, phone, and email from billToDetails metadata
    let customerPhone = '';
    let customerEmail = '';

    if (file.billToDetails) {
      if (file.billToDetails.Name) {
        customerName = String(file.billToDetails.Name);
      } else if (file.billToDetails.CompanyName) {
        customerName = String(file.billToDetails.CompanyName);
      } else {
        const firstValue = Object.values(file.billToDetails).find(v => v && (typeof v === 'string' || typeof v === 'number'));
        if (firstValue) customerName = String(firstValue);
      }

      // Extract Phone and Email
      if (file.billToDetails.Phone) customerPhone = String(file.billToDetails.Phone);
      if (file.billToDetails.Email) customerEmail = String(file.billToDetails.Email);
    }

    // Validations for placeholder values
    const isPlaceholder = (value: any, placeholders: string[]) => {
      if (!value) return true;
      const strValue = String(value);
      const lowerVal = strValue.trim().toLowerCase();
      return placeholders.some(p => lowerVal === p.toLowerCase());
    };

    // Clean Name
    if (isPlaceholder(customerName, ['[Name]', '[Company Name]', ''])) {
      customerName = '';
    }

    // Clean Phone
    if (isPlaceholder(customerPhone, ['Phone', '[Phone]', 'Phone:', ''])) {
      customerPhone = '';
    }

    // Clean Email
    if (isPlaceholder(customerEmail, ['Email', '[Email]', 'Email:', ''])) {
      customerEmail = '';
    }

    // Fallback: try to extract from content if billToDetails not available
    if (!customerName && !customerPhone && !customerEmail && file.content) {
      try {
        let mscContent;
        if (typeof file.content === 'object') {
          mscContent = file.content.msc || file.content;
        } else {
          try {
            mscContent = JSON.parse(decodeURIComponent(file.content));
          } catch (e) {
            // ignore
          }
        }

        // If total was not in the file object, try extraction (optional, file.total should have it)
        if (amount === 0 && file.total !== undefined) {
          amount = file.total;
        }
      } catch (e) {
        console.error("Error parsing invoice for metadata", e);
      }
    }

    // If everything is empty after checks, show -
    if (!customerName && !customerPhone && !customerEmail) {
      customerName = '-';
    }

    const itemsCount = file.items?.length || 0;

    return {
      id: file.key,
      invoiceId: invoiceNumber,
      customer: customerName,
      phone: customerPhone,
      email: customerEmail,
      amount: (amount !== null && amount !== undefined) ? new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(amount) : '-',
      status,
      date,
      itemsCount
    };
  };

  const handleIpfsImport = async (cid: string) => {
    if (!cid || !cid.trim()) {
      setToastMessage("Please enter a valid IPFS CID");
      setShowToast(true);
      return;
    }

    setIpfsImporting(true);
    setToastMessage("Retrieving invoice from IPFS...");
    setShowToast(true);

    try {
      const invoiceData = await ipfsService.fetchFromIpfs(cid);
      
      let invoiceName = invoiceData.name || invoiceData.id;
      let finalId = invoiceData.id;
      
      const exists = await localTemplateService.invoiceExists(finalId);
      if (exists) {
        const timestamp = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/:/g, '');
        invoiceName = `${invoiceName} (Imported ${timestamp})`;
        finalId = `${finalId}_imported_${Date.now().toString().slice(-4)}`;
      }

      const success = await localTemplateService.saveInvoice({
        ...invoiceData,
        id: finalId,
        name: invoiceName
      });

      if (success) {
        setToastMessage(`Successfully imported "${invoiceName}" from IPFS!`);
        await renderFileList();
        props.onDataChange?.();
      } else {
        setToastMessage("Failed to save imported invoice locally.");
      }
    } catch (e: any) {
      console.error("IPFS Import Error:", e);
      setToastMessage(`Import failed: ${e.message || e}`);
    } finally {
      setIpfsImporting(false);
      setShowToast(true);
    }
  };

  const handleDirectPinToIpfs = async (file: any) => {
    setToastMessage("Uploading to IPFS via Pinata...");
    setShowToast(true);

    try {
      const fullInvoice = await localTemplateService.getInvoice(file.key);
      if (!fullInvoice) {
        throw new Error("Could not load invoice data.");
      }

      const pinResult = await ipfsService.pinToIpfs(fullInvoice);
      
      setDirectCid(pinResult.IpfsHash);
      setDirectInvoiceName(fullInvoice.name);
      
      try {
        await navigator.clipboard.writeText(pinResult.IpfsHash);
        setToastMessage("IPFS CID copied to clipboard!");
      } catch (e) {
        // ignore clipboard error
      }
      
      setShowDirectIpfsAlert(true);
    } catch (error: any) {
      console.error("Direct pin failed:", error);
      setToastMessage(`Pin failed: ${error.message || error}`);
      setShowToast(true);
    }
  };

  const renderFileList = async () => {
    let content;
    try {
      let filesArray: any[] = [];

      // Local files
      try {
        const localInvoices = await localTemplateService.getSavedInvoices();
        filesArray = localInvoices.map((inv: any) => ({
          key: inv.id,
          name: inv.name,
          date: inv.modifiedAt || inv.createdAt,
          dateCreated: inv.createdAt,
          dateModified: inv.modifiedAt,
          type: "local",
          // Extended invoice metadata
          invoiceId: inv.id,
          content: inv.content, // Pass content for extraction
          invoiceName: inv.name,
          billToDetails: inv.billToDetails,
          status: 'draft',
          invoiceNumber: inv.invoiceNumber || '',
          total: inv.total,
          templateMetadata: inv.templateId ? {
            templateId: inv.templateId,
            template: getTemplateInfo(Number(inv.templateId))
          } : null
        }));
      } catch (err) {
        console.error("Failed to fetch local invoices", err);
      }

      // Filter by category
      let filteredFiles = filesArray;

      // Apply search filter
      filteredFiles = filterFilesBySearch(filteredFiles, searchQuery);



      if (filteredFiles.length === 0) {
        const isSearchOrFilter = searchQuery.trim();
        const title = isSearchOrFilter ? "No files found" : "No invoices found";
        const subtitle = searchQuery.trim()
          ? `No files matching "${searchQuery}"`
          : "Create your first invoice to get started";

        content = (
          <div style={{
            padding: "40px 20px",
            marginTop: "24px",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <EmptyInvoicesIcon width={120} height={120} />
            <h3 style={{
              marginTop: '16px',
              marginBottom: '8px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#1e293b'
            }}>
              {title}
            </h3>
            <p style={{
              margin: '0 0 24px 0',
              color: '#64748b',
              fontSize: '14px'
            }}>
              {subtitle}
            </p>
            <IonButton
              fill="solid"
              color="primary"
              onClick={handleCreateInvoice}
              disabled={isCreating}
              style={{
                height: '36px',
                fontSize: '14px',
                textTransform: 'none',
                '--padding-start': '12px',
                '--padding-end': '16px',
                '--border-radius': '8px',
                fontWeight: 500
              }}
            >
              <IonIcon icon={add} slot="start" style={{ fontSize: '18px', marginRight: '4px' }} />
              Create
            </IonButton>
          </div>
        );
      } else {
        try {
          const sortedFiles = sortFiles(filteredFiles, sortBy);

          content = (
            <div className="files-list-container">
              <div style={{
                overflowX: 'auto',
                background: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                marginTop: '16px'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', minWidth: '160px' }}>Invoice ID</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Customer</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Amount</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b', minWidth: '150px' }}>Date</th>
                      <th style={{ padding: '8px 14px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFiles.map((file) => {
                      const meta = getInvoiceMetadata(file);
                      return (
                        <tr
                          key={file.key}
                          onClick={() => editFile(file.key)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.backgroundColor = '#e2e8f0';
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            transition: 'background-color 0.1s ease'
                          }}
                        >
                          <td style={{ padding: '8px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <IonIcon
                                icon={documentText}
                                style={{
                                  fontSize: '16px',
                                  marginRight: '8px',
                                  color: '#94a3b8',
                                  minWidth: '16px'
                                }}
                              />
                              <span style={{
                                fontWeight: '500',
                                color: '#0f172a',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                whiteSpace: 'nowrap'
                              }}>{meta.invoiceId}</span>
                            </div>
                          </td>
                          <td style={{ padding: '8px 14px', color: '#475569', fontSize: '14px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '500' }}>{meta.customer}</span>
                              {(meta.phone) && (
                                <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                  {[meta.phone].filter(Boolean).join(' • ')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '8px 14px', color: '#475569', fontSize: '14px' }}>{meta.amount}</td>
                          <td style={{ padding: '8px 14px', color: '#475569', fontSize: '14px' }}>{meta.date}</td>
                          <td style={{ padding: '8px 14px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  renameFile(file.key);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  color: '#3b82f6',
                                  padding: '6px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#eff6ff'
                                }}
                                title="Rename"
                              >
                                <IonIcon icon={create} style={{ fontSize: '16px' }} />
                              </div>
                              <div
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await handleDirectPinToIpfs(file);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  color: '#10b981',
                                  padding: '6px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#ecfdf5'
                                }}
                                title="Pin to IPFS"
                              >
                                <IonIcon icon={cloudUploadOutline} style={{ fontSize: '16px' }} />
                              </div>
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFile(file.key);
                                }}
                                style={{
                                  cursor: 'pointer',
                                  color: '#ef4444',
                                  padding: '6px',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  background: '#fef2f2'
                                }}
                                title="Delete"
                              >
                                <IonIcon icon={trash} style={{ fontSize: '16px' }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        } catch (error) {
          console.error("Error rendering file list", error);
          content = <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>Error loading files</div>;
        }
      }
    } finally {
    }
    setFileListContent(content);
  };

  useEffect(() => {
    renderFileList();
    // eslint-disable-next-line
  }, [
    // fileSource, // removed
    searchQuery,
    sortBy,
  ]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 692);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Reset sort option when switching file sources to ensure compatibility
  // Reset sort option when switching file sources to ensure compatibility
  // useEffect(() => {
  //   if (sortBy === "date") {
  //     setSortBy("dateModified");
  //   }
  // }, [fileSource]);

  return (
    <div>
      <div>
        <div className="files-modal-content" style={{ padding: 0 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div style={{ width: '100%', marginBottom: '16px' }}>
              {/* Local tab removed */}
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                maxWidth: "1200px",
                margin: "0 auto",
                flexWrap: "wrap",
              }}
            >
              <IonSearchbar
                placeholder="Search files by name..."
                value={searchQuery}
                onIonInput={(e) => setSearchQuery(e.detail.value!)}
                onIonClear={() => setSearchQuery("")}
                showClearButton="focus"
                debounce={300}
                style={{ flex: "2", minWidth: "200px" }}
              />

              <IonButton
                fill="outline"
                color="secondary"
                onClick={() => setShowIpfsImportAlert(true)}
                disabled={ipfsImporting}
                style={{
                  height: '36px',
                  fontSize: '13px',
                  textTransform: 'none',
                  '--border-radius': '8px',
                  fontWeight: 500,
                  marginRight: '8px'
                }}
              >
                <IonIcon icon={cloudDownloadOutline} slot="start" style={{ fontSize: '18px', marginRight: '4px' }} />
                Import IPFS
              </IonButton>



              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: "1",
                  minWidth: isSmallScreen ? "32px" : "140px",
                  maxWidth: isSmallScreen ? "32px" : "180px",
                }}
              >
                <IonIcon
                  icon={swapVertical}
                  style={{
                    marginRight: isSmallScreen ? "0" : "4px",
                    fontSize: "16px",
                  }}
                />
                {!isSmallScreen && (
                  <IonSelect
                    value={sortBy}
                    placeholder="Sort by"
                    onIonChange={(e) => setSortBy(e.detail.value)}
                    style={{
                      flex: "1",
                      "--placeholder-color": "var(--ion-color-medium)",
                      "--color": "var(--ion-color-dark)",
                    }}
                    interface="popover"
                  >
                    <IonSelectOption value="date">By Date</IonSelectOption>
                    <IonSelectOption value="name">By Name</IonSelectOption>
                  </IonSelect>
                )}
                {isSmallScreen && (
                  <IonSelect
                    value={sortBy}
                    placeholder=""
                    onIonChange={(e) => setSortBy(e.detail.value)}
                    style={{
                      flex: "1",
                      "--placeholder-color": "var(--ion-color-medium)",
                      "--color": "var(--ion-color-dark)",
                      width: "5px",
                      minWidth: "5px",
                    }}
                    interface="popover"
                  >
                    <IonSelectOption value="date">By Date</IonSelectOption>
                    <IonSelectOption value="name">By Name</IonSelectOption>
                  </IonSelect>
                )}
              </div>
            </div>
          </div>
        </div>
        <div
          className="files-scrollable-container"
          style={{
            maxWidth: "1200px",
            margin: "0 auto 8px auto", // Added 8px bottom margin to match original CSS intent
          }}
        >
          {fileListContent}
        </div>
      </div>

      <IonAlert
        animated
        isOpen={showAlert1}
        onDidDismiss={() => setShowAlert1(false)}
        header="Delete file"
        message={"Do you want to delete the " + currentKey + " file?"}
        buttons={[
          { text: "No", role: "cancel" },
          {
            text: "Yes",
            handler: async () => {
              if (currentKey) {
                // Local delete
                await localTemplateService.deleteInvoice(currentKey);
                setCurrentKey(null);
                await renderFileList();
                // Notify parent component that data has changed
                props.onDataChange?.();
              }
            },
          },
        ]}
      />

      {/* Import from IPFS Alert */}
      <IonAlert
        animated
        isOpen={showIpfsImportAlert}
        onDidDismiss={() => setShowIpfsImportAlert(false)}
        header="Import Invoice from IPFS"
        message="Enter the IPFS Content Identifier (CID) of the invoice:"
        inputs={[
          {
            name: "cid",
            type: "text",
            placeholder: "Enter IPFS CID...",
          }
        ]}
        buttons={[
          {
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Import",
            handler: (data) => {
              const cid = data.cid?.trim();
              if (cid) {
                setTimeout(() => handleIpfsImport(cid), 100);
              } else {
                setToastMessage("CID cannot be empty");
                setShowToast(true);
              }
            }
          }
        ]}
      />

      {/* Pinned Direct Result Alert */}
      <IonAlert
        animated
        isOpen={showDirectIpfsAlert}
        onDidDismiss={() => {
          setShowDirectIpfsAlert(false);
          setDirectCid("");
          setDirectInvoiceName("");
        }}
        header="Saved to IPFS"
        message={`Invoice "${directInvoiceName}" has been successfully pinned to IPFS.\n\nCID:\n${directCid}\n\nThe CID has been copied to your clipboard.`}
        buttons={[
          {
            text: "Copy CID Again",
            handler: () => {
              navigator.clipboard.writeText(directCid);
              setToastMessage("CID copied to clipboard!");
              setShowToast(true);
            }
          },
          {
            text: "OK",
            role: "cancel"
          }
        ]}
      />

      {/* Rename File Alert Wrapper */}
      {showRenameAlert && currentRenameKey && (
        <IonAlert
          animated
          isOpen={true}
          onDidDismiss={() => {
            setShowRenameAlert(false);
            setCurrentRenameKey(null);
            setRenameFileName("");
          }}
          header="Rename File"
          message={`Enter a new name for "${currentRenameKey}"`}
          inputs={[
            {
              name: "filename",
              type: "text",
              value: renameFileName,
              placeholder: "Enter new filename",
            },
          ]}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setCurrentRenameKey(null);
                setRenameFileName("");
              },
            },
            {
              text: "Rename",
              handler: (data) => {
                const newFileName = data.filename?.trim();
                if (newFileName) {
                  handleRename(newFileName);
                } else {
                  setToastMessage("Filename cannot be empty");
                  setShowToast(true);
                }
              },
            },
          ]}
        />
      )}
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        position="top"
      />


    </div>
  );
};

export default Files;
