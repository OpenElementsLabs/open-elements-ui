/**
 * Access to `window.localStorage` that never throws.
 *
 * Storage can be missing (server rendering, `dom.storage.enabled = false`) or throw on access
 * (site data blocked in hardened browsers such as LibreWolf, quota exceeded). Persisted values in
 * this library are only conveniences, so every failure falls back to "nothing stored".
 */
function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export const safeStorage = {
  /** Returns the stored value, or `null` if nothing is stored or storage is unavailable. */
  get(key: string): string | null {
    try {
      return storage()?.getItem(key) ?? null;
    } catch {
      return null;
    }
  },

  /** Stores the value; does nothing if storage is unavailable. */
  set(key: string, value: string): void {
    try {
      storage()?.setItem(key, value);
    } catch {
      // Storage unavailable or full: the value is simply not persisted.
    }
  },

  /** Removes the value; does nothing if storage is unavailable. */
  remove(key: string): void {
    try {
      storage()?.removeItem(key);
    } catch {
      // Storage unavailable: nothing to remove.
    }
  },
} as const;
