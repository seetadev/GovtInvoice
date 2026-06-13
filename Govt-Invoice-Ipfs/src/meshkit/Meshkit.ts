import { PinataProvider } from "./providers/PinataProvider";
import {
  StorageProvider,
  MeshkitConfig,
  StoreOptions,
  MeshkitRecord,
  RetrieveOptions,
  MeshkitMessage,
} from "./types";
export class Meshkit {
  constructor(
    private provider: StorageProvider
  ) {}

  static async init(config: MeshkitConfig) {
    const provider = new PinataProvider(
      config.providerToken,
      config.gatewayUrl
    );

    return new Meshkit(provider);
  }

  async store<T>(
    data: T,
    options?: StoreOptions
  ): Promise<MeshkitRecord<T>> {
    const cid = await this.provider.putJSON(data);

    return {
      cid,
      timestamp: Date.now(),
      data,
      size: JSON.stringify(data).length,
    };
  }

  async retrieve<T>(
    cid: string,
    options?: RetrieveOptions
  ): Promise<T> {
    return await this.provider.getJSON(cid);
  }

  async testConnection() {
    return this.provider.testAuth();
  }

  async upload(
    file: Blob | File,
    options?: StoreOptions
  ): Promise<MeshkitRecord<void>> {
    const cid = await this.provider.putFile(file);

    return {
      cid,
      timestamp: Date.now(),
      data: undefined,
      size: file.size,
    };
  }

  async download(cid: string): Promise<Blob> {
    return await this.provider.getFile(cid);
  }

  async send(
    recipientId: string,
    message: string
  ): Promise<MeshkitRecord<MeshkitMessage>> {
    const payload: MeshkitMessage = {
      recipientId,
      payload: message,
      timestamp: Date.now(),
    };

    return await this.store(payload);
  }

  async receive(
    cid: string
  ): Promise<MeshkitMessage> {
    return await this.retrieve<MeshkitMessage>(cid);
  }
}