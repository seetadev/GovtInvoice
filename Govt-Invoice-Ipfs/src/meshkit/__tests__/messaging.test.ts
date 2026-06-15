import { beforeEach, describe, expect, it, vi } from "vitest";
import { Meshkit } from "../Meshkit";
import type { MeshkitMessage, StorageProvider } from "../types";

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

describe("Meshkit messaging", () => {
  let provider: StorageProvider;
  let meshkit: Meshkit;

  beforeEach(() => {
    provider = createProviderMock();
    meshkit = new Meshkit(provider);
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);
  });

  describe("send", () => {
    it("wraps message payload correctly", async () => {
      vi.mocked(provider.putJSON).mockResolvedValue("bafy-message");

      const record = await meshkit.send("recipient-001", "hello");

      const expectedMessage: MeshkitMessage = {
        recipientId: "recipient-001",
        payload: "hello",
        timestamp: 1_700_000_000_000,
      };

      expect(provider.putJSON).toHaveBeenCalledWith(expectedMessage);
      expect(record.data).toEqual(expectedMessage);
    });

    it("delegates to store", async () => {
      const storeSpy = vi.spyOn(meshkit, "store");
      vi.mocked(provider.putJSON).mockResolvedValue("bafy-message");

      await meshkit.send("recipient-001", "hello");

      expect(storeSpy).toHaveBeenCalledWith({
        recipientId: "recipient-001",
        payload: "hello",
        timestamp: 1_700_000_000_000,
      });
    });

    it("supports an empty payload", async () => {
      vi.mocked(provider.putJSON).mockResolvedValue("bafy-empty-message");

      const record = await meshkit.send("recipient-001", "");

      expect(record.data?.payload).toBe("");
      expect(record.size).toBe(JSON.stringify(record.data).length);
    });

    it("propagates store/provider errors", async () => {
      vi.mocked(provider.putJSON).mockRejectedValue(new Error("Send failed"));

      await expect(meshkit.send("recipient-001", "hello")).rejects.toThrow(
        "Send failed"
      );
    });
  });

  describe("receive", () => {
    it("delegates to retrieve", async () => {
      const message: MeshkitMessage = {
        recipientId: "recipient-001",
        payload: "hello",
        timestamp: 1_700_000_000_000,
      };
      const retrieveSpy = vi.spyOn(meshkit, "retrieve");
      vi.mocked(provider.getJSON).mockResolvedValue(message);

      await meshkit.receive("bafy-message");

      expect(retrieveSpy).toHaveBeenCalledWith("bafy-message");
    });

    it("returns a MeshkitMessage", async () => {
      const message: MeshkitMessage = {
        recipientId: "recipient-001",
        payload: "hello",
        timestamp: 1_700_000_000_000,
      };
      vi.mocked(provider.getJSON).mockResolvedValue(message);

      const result = await meshkit.receive("bafy-message");

      expect(result).toEqual(message);
    });

    it("delegates empty cid handling to the provider", async () => {
      vi.mocked(provider.getJSON).mockRejectedValue(new Error("Invalid CID"));

      await expect(meshkit.receive("")).rejects.toThrow("Invalid CID");
      expect(provider.getJSON).toHaveBeenCalledWith("");
    });

    it("returns invalid message-shaped provider responses unchanged", async () => {
      vi.mocked(provider.getJSON).mockResolvedValue({
        payload: "missing recipient",
      });

      const result = await meshkit.receive("bafy-invalid-message");

      expect(result).toEqual({ payload: "missing recipient" });
    });
  });
});
