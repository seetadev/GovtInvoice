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

describe("Meshkit.retrieve", () => {
  let provider: StorageProvider;
  let meshkit: Meshkit;

  beforeEach(() => {
    provider = createProviderMock();
    meshkit = new Meshkit(provider);
  });

  it("calls provider.getJSON with the cid", async () => {
    vi.mocked(provider.getJSON).mockResolvedValue({ hello: "world" });

    await meshkit.retrieve("bafy-json");

    expect(provider.getJSON).toHaveBeenCalledWith("bafy-json");
  });

  it("returns parsed data from the provider", async () => {
    type StoredData = { id: string; total: number };
    const storedData: StoredData = { id: "invoice-001", total: 1200 };
    vi.mocked(provider.getJSON).mockResolvedValue(storedData);

    const result = await meshkit.retrieve<StoredData>("bafy-json");

    expect(result).toEqual(storedData);
  });

  it("delegates empty cid handling to the provider", async () => {
    vi.mocked(provider.getJSON).mockRejectedValue(new Error("Invalid CID"));

    await expect(meshkit.retrieve("")).rejects.toThrow("Invalid CID");
    expect(provider.getJSON).toHaveBeenCalledWith("");
  });

  it("propagates provider errors", async () => {
    vi.mocked(provider.getJSON).mockRejectedValue(new Error("Gateway failed"));

    await expect(meshkit.retrieve("bafy-json")).rejects.toThrow(
      "Gateway failed"
    );
  });

  it("returns invalid provider responses unchanged", async () => {
    vi.mocked(provider.getJSON).mockResolvedValue(null);

    const result = await meshkit.retrieve<null>("bafy-null");

    expect(result).toBeNull();
  });
});
