import { beforeEach, describe, expect, it, vi } from "vitest";
import { Meshkit } from "../Meshkit";
import type { StorageProvider } from "../types";

function createProviderMock(): StorageProvider {
  return {
    putJSON: vi.fn(),
    getJSON: vi.fn(),
    putFile: vi.fn(),
    getFile: vi.fn(),
    delete: vi.fn(),
    testAuth: vi.fn(),
  };
}

describe("Meshkit.testConnection", () => {
  let provider: StorageProvider;
  let meshkit: Meshkit;

  beforeEach(() => {
    provider = createProviderMock();
    meshkit = new Meshkit(provider);
  });

  it("returns true when provider authentication succeeds", async () => {
    vi.mocked(provider.testAuth).mockResolvedValue(true);

    await expect(meshkit.testConnection()).resolves.toBe(true);
    expect(provider.testAuth).toHaveBeenCalledOnce();
  });

  it("returns false when provider authentication resolves false", async () => {
    vi.mocked(provider.testAuth).mockResolvedValue(false);

    await expect(meshkit.testConnection()).resolves.toBe(false);
    expect(provider.testAuth).toHaveBeenCalledOnce();
  });

  it("propagates provider failures", async () => {
    vi.mocked(provider.testAuth).mockRejectedValue(
      new Error("Authentication failed")
    );

    await expect(meshkit.testConnection()).rejects.toThrow(
      "Authentication failed"
    );
    expect(provider.testAuth).toHaveBeenCalledOnce();
  });
});
