import { beforeEach, describe, expect, it, vi } from "vitest";
import { Meshkit } from "../Meshkit";
import type { MeshkitRecord, StorageProvider } from "../types";

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

describe("Meshkit.upload", () => {
  let provider: StorageProvider;
  let meshkit: Meshkit;

  beforeEach(() => {
    provider = createProviderMock();
    meshkit = new Meshkit(provider);
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  it("calls provider.putFile with the file", async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    vi.mocked(provider.putFile).mockResolvedValue("bafy-file");

    await meshkit.upload(file);

    expect(provider.putFile).toHaveBeenCalledWith(file);
  });

  it("returns a MeshkitRecord with correct size calculation", async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    vi.mocked(provider.putFile).mockResolvedValue("bafy-file");

    const record: MeshkitRecord<void> = await meshkit.upload(file);

    expect(record).toEqual({
      cid: "bafy-file",
      timestamp: 1_700_000_000_000,
      data: undefined,
      size: file.size,
    });
  });

  it("supports empty files", async () => {
    const file = new File([""], "empty.txt", { type: "text/plain" });
    vi.mocked(provider.putFile).mockResolvedValue("bafy-empty-file");

    const record = await meshkit.upload(file);

    expect(record.size).toBe(0);
  });

  it("supports Blob uploads", async () => {
    const blob = new Blob(["binary"], { type: "application/octet-stream" });
    vi.mocked(provider.putFile).mockResolvedValue("bafy-blob");

    const record = await meshkit.upload(blob);

    expect(provider.putFile).toHaveBeenCalledWith(blob);
    expect(record.size).toBe(blob.size);
  });

  it("propagates provider errors", async () => {
    const file = new File(["hello"], "hello.txt", { type: "text/plain" });
    vi.mocked(provider.putFile).mockRejectedValue(new Error("Upload failed"));

    await expect(meshkit.upload(file)).rejects.toThrow("Upload failed");
  });
});
