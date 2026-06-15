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

describe("Meshkit.store", () => {
  let provider: StorageProvider;
  let meshkit: Meshkit;

  beforeEach(() => {
    provider = createProviderMock();
    meshkit = new Meshkit(provider);
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  it("calls provider.putJSON with the payload", async () => {
    const payload = { id: "invoice-001", total: 1200 };
    vi.mocked(provider.putJSON).mockResolvedValue("bafy-json");

    await meshkit.store(payload);

    expect(provider.putJSON).toHaveBeenCalledWith(payload);
  });

  it("returns a MeshkitRecord and preserves payload", async () => {
    const payload = { hello: "world" };
    vi.mocked(provider.putJSON).mockResolvedValue("bafy-json");

    const record: MeshkitRecord<typeof payload> = await meshkit.store(payload);

    expect(record).toEqual({
      cid: "bafy-json",
      timestamp: 1_700_000_000_000,
      data: payload,
      size: JSON.stringify(payload).length,
    });
  });

  it("supports an empty object payload", async () => {
    const payload: Record<string, never> = {};
    vi.mocked(provider.putJSON).mockResolvedValue("bafy-empty-object");

    const record = await meshkit.store(payload);

    expect(record.data).toEqual({});
    expect(record.size).toBe(2);
  });

  it("supports an empty string payload", async () => {
    vi.mocked(provider.putJSON).mockResolvedValue("bafy-empty-string");

    const record = await meshkit.store("");

    expect(record.data).toBe("");
    expect(record.size).toBe(JSON.stringify("").length);
  });

  it("propagates provider errors", async () => {
    vi.mocked(provider.putJSON).mockRejectedValue(new Error("Pin failed"));

    await expect(meshkit.store({ id: "invoice-001" })).rejects.toThrow(
      "Pin failed"
    );
  });

  it("throws when payload cannot be serialized for size calculation", async () => {
    const circularPayload: { self?: unknown } = {};
    circularPayload.self = circularPayload;
    vi.mocked(provider.putJSON).mockResolvedValue("bafy-circular");

    await expect(meshkit.store(circularPayload)).rejects.toThrow(
      /circular structure/i
    );
  });
});
