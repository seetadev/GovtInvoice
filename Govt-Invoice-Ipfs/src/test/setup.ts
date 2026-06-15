import { vi } from "vitest";

globalThis.fetch = vi.fn(() => {
  throw new Error("Unexpected network call in test");
}) as unknown as typeof fetch;
