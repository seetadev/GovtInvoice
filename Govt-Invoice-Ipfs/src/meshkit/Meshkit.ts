import { PinataProvider } from "./providers/PinataProvider";
import {
  StorageProvider,
  MeshkitConfig,
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

  async testConnection() {
    return this.provider.testAuth();
  }
}