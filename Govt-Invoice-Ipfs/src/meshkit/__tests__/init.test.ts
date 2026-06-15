import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MeshkitConfig, StorageProvider } from "../types";

const { mockProvider, pinataProviderConstructor } = vi.hoisted(() => {
  const provider: StorageProvider = {
    putJSON: vi.fn(),
    getJSON: vi.fn(),
    putFile: vi.fn(),
    getFile: vi.fn(),
    delete: vi.fn(),
    testAuth: vi.fn(),
  };

  return {
    mockProvider: provider,
    pinataProviderConstructor: vi.fn(function (
      this: StorageProvider,
      jwt: string,
      gatewayUrl?: string
    ) {
      void gatewayUrl;

      if (!jwt?.trim()) {
        throw new Error("Pinata JWT is required");
      }

      return provider;
    }),
  };
});

vi.mock("../providers/PinataProvider", () => ({
  PinataProvider: pinataProviderConstructor,
}));

describe("Meshkit.init", () => {
  beforeEach(() => {
    pinataProviderConstructor.mockClear();
  });

  it("creates a Meshkit instance", async () => {
    const { Meshkit } = await import("../Meshkit");

    const meshkit = await Meshkit.init({
      provider: "pinata",
      providerToken: "test-token",
    });

    expect(meshkit).toBeInstanceOf(Meshkit);
    expect(pinataProviderConstructor).toHaveBeenCalledWith(
      "test-token",
      undefined
    );
  });

  it("passes gatewayUrl to the provider", async () => {
    const { Meshkit } = await import("../Meshkit");

    await Meshkit.init({
      provider: "pinata",
      providerToken: "test-token",
      gatewayUrl: "https://gateway.example/ipfs/",
    });

    expect(pinataProviderConstructor).toHaveBeenCalledWith(
      "test-token",
      "https://gateway.example/ipfs/"
    );
  });

  it("validates configuration through the provider constructor", async () => {
    const { Meshkit } = await import("../Meshkit");

    await expect(
      Meshkit.init({
        provider: "pinata",
        providerToken: "   ",
      })
    ).rejects.toThrow("Pinata JWT is required");
  });

  it("currently initializes PinataProvider for a runtime invalid provider value", async () => {
    const { Meshkit } = await import("../Meshkit");
    const config = {
      provider: "invalid-provider",
      providerToken: "test-token",
    } as unknown as MeshkitConfig;

    const meshkit = await Meshkit.init(config);

    expect(meshkit).toBeInstanceOf(Meshkit);
    expect(pinataProviderConstructor).toHaveBeenCalledWith(
      "test-token",
      undefined
    );
  });
});
