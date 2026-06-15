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

describe("Meshkit.revoke", () => {
  let provider: StorageProvider;
  let meshkit: Meshkit;

  beforeEach(() => {
    provider = createProviderMock();
    meshkit = new Meshkit(provider);
  });

  it("delegates to provider.delete with the cid", async () => {
    vi.mocked(provider.delete).mockResolvedValue(true);

    await meshkit.revoke("bafy-json");

    expect(provider.delete).toHaveBeenCalledWith("bafy-json");
  });

  it("returns true on successful revocation", async () => {
    vi.mocked(provider.delete).mockResolvedValue(true);

    await expect(meshkit.revoke("bafy-json")).resolves.toBe(true);
  });

  it("returns false when the provider resolves false", async () => {
    vi.mocked(provider.delete).mockResolvedValue(false);

    await expect(meshkit.revoke("bafy-json")).resolves.toBe(false);
  });

  it("delegates empty cid handling to the provider", async () => {
    vi.mocked(provider.delete).mockRejectedValue(new Error("Invalid CID"));

    await expect(meshkit.revoke("")).rejects.toThrow("Invalid CID");
    expect(provider.delete).toHaveBeenCalledWith("");
  });

  it("propagates provider failures", async () => {
    vi.mocked(provider.delete).mockRejectedValue(new Error("Unpin failed"));

    await expect(meshkit.revoke("bafy-json")).rejects.toThrow("Unpin failed");
  });
});
