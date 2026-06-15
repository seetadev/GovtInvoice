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

describe("Meshkit.download", () => {
  let provider: StorageProvider;
  let meshkit: Meshkit;

  beforeEach(() => {
    provider = createProviderMock();
    meshkit = new Meshkit(provider);
  });

  it("calls provider.getFile with the cid", async () => {
    const blob = new Blob(["hello"], { type: "text/plain" });
    vi.mocked(provider.getFile).mockResolvedValue(blob);

    await meshkit.download("bafy-file");

    expect(provider.getFile).toHaveBeenCalledWith("bafy-file");
  });

  it("returns a Blob from the provider", async () => {
    const blob = new Blob(["hello"], { type: "text/plain" });
    vi.mocked(provider.getFile).mockResolvedValue(blob);

    const result = await meshkit.download("bafy-file");

    expect(result).toBe(blob);
    expect(result).toBeInstanceOf(Blob);
    expect(result.size).toBe(blob.size);
    expect(result.type).toBe("text/plain");
  });

  it("delegates empty cid handling to the provider", async () => {
    vi.mocked(provider.getFile).mockRejectedValue(new Error("Invalid CID"));

    await expect(meshkit.download("")).rejects.toThrow("Invalid CID");
    expect(provider.getFile).toHaveBeenCalledWith("");
  });

  it("propagates provider errors", async () => {
    vi.mocked(provider.getFile).mockRejectedValue(new Error("Gateway failed"));

    await expect(meshkit.download("bafy-file")).rejects.toThrow(
      "Gateway failed"
    );
  });
});
