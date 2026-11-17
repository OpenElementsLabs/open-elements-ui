import { afterEach, describe, expect, it, vi } from "vitest";
import { safeStorage } from "../safe-storage.ts";

const throwingStorage = {
  getItem: () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  },
  setItem: () => {
    throw new DOMException("The quota has been exceeded.", "QuotaExceededError");
  },
  removeItem: () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("safeStorage", () => {
  it("reads back a stored value", () => {
    safeStorage.set("key", "value");
    expect(safeStorage.get("key")).toBe("value");
  });

  it("returns null for a key that is not stored", () => {
    expect(safeStorage.get("missing")).toBeNull();
  });

  it("removes a stored value", () => {
    safeStorage.set("key", "value");
    safeStorage.remove("key");
    expect(safeStorage.get("key")).toBeNull();
  });

  it("does not throw when every storage call throws", () => {
    vi.stubGlobal("localStorage", throwingStorage);
    expect(safeStorage.get("key")).toBeNull();
    expect(() => safeStorage.set("key", "value")).not.toThrow();
    expect(() => safeStorage.remove("key")).not.toThrow();
  });

  it("does not throw when localStorage is null", () => {
    vi.stubGlobal("localStorage", null);
    expect(safeStorage.get("key")).toBeNull();
    expect(() => safeStorage.set("key", "value")).not.toThrow();
    expect(() => safeStorage.remove("key")).not.toThrow();
  });

  it("does not throw when accessing localStorage itself throws", () => {
    const getter = vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("The operation is insecure.", "SecurityError");
    });
    try {
      expect(safeStorage.get("key")).toBeNull();
      expect(() => safeStorage.set("key", "value")).not.toThrow();
    } finally {
      getter.mockRestore();
    }
  });
});
