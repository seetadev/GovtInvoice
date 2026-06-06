// Settings utility functions for managing app preferences

export type InvoiceFormat = 'invoice-date-timestamp' | 'unique-id' | 'sequential';

interface AppSettings {
  autoSaveEnabled: boolean;
  defaultCurrency: string;
  invoiceFormat: InvoiceFormat;
  sequentialNumber: number;
  invoicePrefix: string;
  ipfsPinataJwt?: string;
  ipfsPinataApiKey?: string;
  ipfsPinataApiSecret?: string;
  ipfsGatewayUrl?: string;
}

const SETTINGS_KEY = "app_settings";

const defaultSettings: AppSettings = {
  autoSaveEnabled: false, // Default to disabled
  defaultCurrency: 'USD',
  invoiceFormat: 'sequential',
  sequentialNumber: 1,
  invoicePrefix: 'INV-',
  ipfsGatewayUrl: 'https://gateway.pinata.cloud/ipfs/'
};

export const getSettings = (): AppSettings => {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    // Error loading settings, return defaults
  }
  return defaultSettings;
};

export const saveSettings = (settings: Partial<AppSettings>): void => {
  try {
    const currentSettings = getSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    // Error saving settings
  }
};

export const getAutoSaveEnabled = (): boolean => {
  return getSettings().autoSaveEnabled;
};

export const setAutoSaveEnabled = (enabled: boolean): void => {
  saveSettings({ autoSaveEnabled: enabled });
};

export const getDefaultCurrency = (): string => {
  return getSettings().defaultCurrency;
};

export const setDefaultCurrency = (currency: string): void => {
  saveSettings({ defaultCurrency: currency });
};

export const getInvoiceFormat = (): InvoiceFormat => {
  return getSettings().invoiceFormat;
};

export const setInvoiceFormat = (format: InvoiceFormat): void => {
  saveSettings({ invoiceFormat: format });
};

export const getSequentialNumber = (): number => {
  return getSettings().sequentialNumber;
};

export const setSequentialNumber = (num: number): void => {
  saveSettings({ sequentialNumber: num });
};

export const getInvoicePrefix = (): string => {
  return getSettings().invoicePrefix;
};

export const setInvoicePrefix = (prefix: string): void => {
  saveSettings({ invoicePrefix: prefix });
};

export const getIpfsSettings = () => {
  const settings = getSettings();
  return {
    ipfsPinataJwt: settings.ipfsPinataJwt || "",
    ipfsPinataApiKey: settings.ipfsPinataApiKey || "",
    ipfsPinataApiSecret: settings.ipfsPinataApiSecret || "",
    ipfsGatewayUrl: settings.ipfsGatewayUrl || "https://gateway.pinata.cloud/ipfs/"
  };
};

export const saveIpfsSettings = (ipfsSettings: {
  ipfsPinataJwt?: string;
  ipfsPinataApiKey?: string;
  ipfsPinataApiSecret?: string;
  ipfsGatewayUrl?: string;
}): void => {
  saveSettings(ipfsSettings);
};

