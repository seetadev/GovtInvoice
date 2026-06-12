export interface MeshkitConfig {
  provider: "pinata" | "filebase" | "storacha";
  providerToken: string;
  gatewayUrl?: string;
  keyService?: KeyService;
}

export interface MeshkitRecord<T = any> {
  cid: string;
  timestamp: number;
  data?: T;
  size: number;
}

export interface KeyService {
  getPublicKey(): Promise<string>;
  sign(message: string): Promise<string>;
  encrypt(
    data: string,
    recipientPublicKey?: string
  ): Promise<string>;
  decrypt(encryptedData: string): Promise<string>;
}

export interface StorageProvider {
  putJSON(data: any): Promise<string>;
  getJSON(cid: string): Promise<any>;
  testAuth(): Promise<boolean>;
}

export interface StoreOptions {
  encrypt?: boolean;
  label?: string;
}

export interface RetrieveOptions {
  decrypt?: boolean;
}

export interface IMeshkit {
  store<T>(
    data: T,
    options?: StoreOptions
  ): Promise<MeshkitRecord<T>>;

  retrieve<T>(
    cid: string,
    options?: RetrieveOptions
  ): Promise<T>;

  testConnection(): Promise<boolean>;
}