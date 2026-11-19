# Upgrade prompt: `@open-elements/ui` 0.10.x → 0.11.0

`@open-elements/ui` 0.11.0 contains no `MarkdownEditor` or `MarkdownView` changes. It brings:

1. **New `safeStorage` utility; storage access never throws** — additive, fixes a crash in hardened browsers.
2. **Dependency updates** — `react-day-picker` 9 → 10 underneath `Calendar` (may affect `Calendar` props), `lucide-react` 1.x now accepted as peer.

> The `MarkdownEditor` toolbar allowlist and the interactive `MarkdownView` checkboxes already shipped in 0.10.0 — see [`upgrade-to-0.10.md`](upgrade-to-0.10.md). If the app skipped those steps when moving to 0.10.0, do them first.

### 1. `safeStorage` (additive)

`LanguageProvider` and `TablePagination` persist their state in `localStorage`. Accessing `localStorage` can throw (site data blocked in hardened browsers such as LibreWolf, `dom.storage.enabled = false`, quota exceeded) — `TablePagination` crashed in that case when the page size was changed. All library storage access now goes through a new exported helper that never throws:

```ts
import { safeStorage } from "@open-elements/ui";

safeStorage.get(key);        // string | null — null if unset or storage unavailable
safeStorage.set(key, value); // no-op if storage unavailable
safeStorage.remove(key);     // no-op if storage unavailable
```

No consumer change is required. Apps that guard `localStorage` themselves can switch to `safeStorage`.

### 2. Dependency updates

- **`react-day-picker` 9 → 10.** `Calendar` forwards all props to `DayPicker` and its prop types come from `react-day-picker`, so a usage that passes `DayPicker`-specific props or `classNames` keys may stop type-checking. The `classNames` key `table` is no longer used — style the grid via `month_grid`.
- **`lucide-react`**: the peer range widened to `^0.500.0 || ^1.0.0`. Apps may stay on 0.x or move to 1.x.
- `@tiptap/*` moved to `^3.31.3` (no API change for consumers).

This file is a self-contained prompt for an agent (Claude Code, etc.) to run inside a consumer repo. Paste it verbatim.

---

## Prompt

You are working inside an app that depends on `@open-elements/ui`. Goal: upgrade to `^0.11.0`. No component API changed; the only consumer-visible risk is the `react-day-picker` major bump underneath `Calendar`.

### What changed in 0.11.0

- **New `safeStorage` export**; `LanguageProvider` and `TablePagination` no longer throw when `localStorage` is blocked.
- **`react-day-picker` 10** underneath `Calendar`, whose props are `DayPicker`'s props.
- **`lucide-react` 1.x** accepted as peer, alongside 0.x.

### Steps

1. **Find the consumer's frontend `package.json`**, bump `@open-elements/ui` to `^0.11.0`, and run:

   ```bash
   pnpm install
   ```

2. **Check `Calendar` usages** against `react-day-picker` 10:

   ```bash
   grep -rn "<Calendar" src app components 2>/dev/null
   ```

   Usages that only pass `mode`, `selected`, `onSelect` and similar common props need no change. If a usage passes a `classNames.table` key, move those classes to `classNames.month_grid`. Let `tsc` (step 4) flag anything else.

3. **Optionally replace hand-rolled `localStorage` guards** (`try { localStorage… } catch {}`) with `safeStorage` from `@open-elements/ui`. Not required.

4. **Verify.** All three must pass:

   ```bash
   pnpm exec tsc --noEmit
   pnpm test
   pnpm build
   ```

5. **Commit** with a clear message:

   ```
   chore(deps): upgrade @open-elements/ui to 0.11.0
   ```

### Guard rails

- **Do not** add `react-day-picker` to your app's dependencies to "fix" a `Calendar` type error — it is the library's transitive dependency. Fix the props passed to `Calendar` instead.
- **Do not** bump `lucide-react` to 1.x as part of this upgrade unless the app wants it anyway — both majors are accepted.
- **Do not** bundle unrelated dependency bumps into the same change.
