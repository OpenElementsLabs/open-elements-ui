# Upgrade prompt: `@open-elements/ui` 0.9.x → 0.10.0 (breaking)

`@open-elements/ui` 0.10.0 bundles three Markdown changes:

1. **Schema fix** — a **data-loss bug** in `MarkdownEditor` and a **rendering gap** in `MarkdownView` are fixed. No API change.
2. **`MarkdownEditor` toolbar is configurable per usage and its default changed** — **breaking** for authoring, not for stored content.
3. **`MarkdownView` task-list checkboxes can be made interactive** — additive.

### 1. Schema fix

Both components previously trimmed the TipTap schema down to paragraphs, a few marks and links, so every other Markdown construct (headings, bullet/ordered lists, task lists, blockquotes, code blocks, horizontal rules) was silently discarded when content was loaded.

In `MarkdownEditor` this destroyed stored data: simply opening a form with such content was enough to corrupt the value passed back through `onChange`, without a single keystroke. In `MarkdownView` the same constructs were flattened to plain text.

0.10.0 opens the schema so all of those constructs **round-trip untouched**. The consumer-visible effect is that content which used to appear as flat text now renders as real structure. This is the intended fix, but it means blocks that were previously invisible-as-structure now take up their natural space.

### 2. `MarkdownEditor` toolbar (breaking)

Previously every `MarkdownEditor` showed the same four buttons (Bold, Italic, Strikethrough, Link). There is now a `toolbar` prop — an ordered allowlist of actions — and the default drops to `["bold", "italic"]`. Every existing usage therefore **loses the Strikethrough and Link buttons** unless it declares them.

Nothing about stored content changes: links, strikethrough and every other construct still render and still round-trip. Only the authoring affordance (which buttons appear) is affected. This prop governs the toolbar, not what the document can hold.

```ts
export type MarkdownToolbarAction =
  | "bold" | "italic" | "strike" | "code" | "link"
  | "h1" | "h2" | "h3"
  | "bulletList" | "orderedList" | "taskList"
  | "blockquote" | "codeBlock" | "horizontalRule";

// New optional prop; defaults to ["bold", "italic"].
<MarkdownEditor value={v} onChange={setV} toolbar={["bold", "italic", "strike", "link"]} />
```

Two smaller changes ride along:

- Task-list creation is gated by the toolbar. Where `"taskList"` is **not** in the allowlist, the `Mod-Shift-9` shortcut and the `[ ] ` input rule do nothing, so a checklist cannot be created by any means. Stored checklists still render and stay editable. All other actions are gated at the button only — `Mod-b` and `**bold**` keep working even where the Bold button is absent.
- Every toolbar button now carries an `aria-label` (and `aria-pressed` for active state), so icon-only buttons are announced by screen readers.

### 3. Interactive `MarkdownView` checkboxes (additive)

`MarkdownView` gains an optional `onChange`. Without it, checkboxes render read-only and a click reverts.

```ts
export interface MarkdownViewProps {
  readonly content: string;
  /**
   * Called when the reader toggles a task list checkbox, with the complete
   * updated Markdown. Omit to render checkboxes as read-only.
   */
  readonly onChange?: (markdown: string) => void | Promise<void>;
}
```

| You pass | Behaviour |
|----------|-----------|
| nothing | Checkboxes render; a click reverts. |
| `(md) => void` | The click applies immediately and `onChange` fires with the full Markdown. No busy state, no rollback. |
| `(md) => Promise<void>` | The click applies immediately; every checkbox is disabled and muted until the Promise settles; on rejection the document reverts to the last confirmed Markdown. |

Only one save can be in flight at a time — clicks during a pending save are ignored — so concurrent saves for the same field are impossible by construction. `MarkdownView` stays read-only for text; only checkboxes are interactive.

This file is a self-contained prompt for an agent (Claude Code, etc.) to run inside a consumer repo. Paste it verbatim.

---

## Prompt

You are working inside an app that depends on `@open-elements/ui`. Goal: upgrade to `^0.10.0`. This is a **breaking** change: the `MarkdownEditor` toolbar default changed, so each usage must declare the actions it needs. On top of that comes a behavioral fix that needs a visual verification pass, and an optional new `MarkdownView` prop.

### What changed in 0.10.0

- **`MarkdownEditor` no longer corrupts content on open.** Loading a value containing headings, lists, task lists, blockquotes, code blocks or horizontal rules no longer strips those constructs and no longer fires a spurious `onChange`. If your app worked around this bug (e.g. by re-saving on load, or by pre-stripping Markdown before passing it in), remove that workaround.
- **`MarkdownView` now renders structure.** Content that previously appeared as a single flat paragraph now renders as headings, lists, task lists (as checkboxes), blockquotes, code blocks and rules.
- **New `toolbar` prop** on `MarkdownEditor`: `readonly toolbar?: readonly MarkdownToolbarAction[]`. It is an ordered allowlist — the buttons render in array order, duplicates collapse, and an empty array renders no toolbar at all.
- **The toolbar default dropped** from Bold/Italic/Strikethrough/Link to `["bold", "italic"]`. Any usage that relied on the old default now shows only Bold and Italic.
- **`taskList` creation is gated by the toolbar**; other actions are gated at the button only.
- **`MarkdownView` gained an optional `onChange`.** When provided, ticking a task-list checkbox applies immediately, reports the complete updated Markdown, and — if `onChange` returns a Promise — disables all checkboxes until it settles and rolls back on rejection. Omitting it keeps checkboxes read-only.
- **Dependency manifest.** Internally the library dropped a duplicate `@tiptap/extension-link` and declared `@tiptap/extension-list`. These are the library's own `dependencies`, resolved transitively — you do **not** manage them in your app.

### Steps

1. **Find the consumer's frontend `package.json`** (repo root or under `frontend/`). Confirm `@open-elements/ui` is listed, then bump it to `^0.10.0` and run:

   ```bash
   pnpm install
   ```

2. **Confirm Tailwind scans the library and loads the typography plugin.** The newly rendered blocks and the task-list styling rely on utility classes (`prose prose-sm`, `list-none`, `pl-0`, `flex`, …) that Tailwind must see in the library source, and on `@tailwindcss/typography` for `prose`. Check the app's main CSS file contains:

   ```css
   @import "tailwindcss";
   @import "@open-elements/ui/src/styles/brand.css";
   @plugin "@tailwindcss/typography";
   @import "tw-animate-css";
   @source "../node_modules/@open-elements/ui/src";
   ```

   Adjust the `@source` path so it is relative to that CSS file. Without the scan, task-list checkboxes pick up a `prose` bullet, for instance.

3. **Visually check every screen that uses `MarkdownView` or `MarkdownEditor`.** Content that was silently flattened will now render as structure. In compact contexts (detail panels, cards, table cells) headings and code blocks may look oversized. If so, add local `prose` overrides *in your app* — do not edit the library. Example:

   ```tsx
   <div className="prose prose-sm prose-headings:text-base prose-headings:font-medium">
     <MarkdownView content={value} />
   </div>
   ```

4. **Remove any load-time corruption workarounds.** Search for code that pre-processes Markdown before handing it to `MarkdownEditor`, or that ignores the first `onChange` after mount. These existed to paper over the old bug and are now unnecessary.

5. **Find every `MarkdownEditor` usage:**

   ```bash
   grep -rn "MarkdownEditor" src app components 2>/dev/null
   ```

6. **For each usage, decide the toolbar explicitly.** Do not blindly restore the old four buttons — this upgrade is the moment to make each field honest about what it offers. Guidance:
   - A **tag / label description** field: keep it minimal, e.g. `toolbar={["bold", "italic"]}` (the new default — you can omit the prop) or `toolbar={[]}` for plain text.
   - A **rich note / task description** field: declare what it needs, e.g. `toolbar={["bold", "italic", "strike", "link", "h2", "h3", "bulletList", "orderedList", "taskList"]}`.
   - If a field previously relied on the Link or Strikethrough buttons, add `"link"` / `"strike"` back **explicitly** where they belong.
   - If a field needs checkboxes, include `"taskList"` — otherwise users cannot create task lists there (stored ones still render and stay editable regardless).

7. **Decide where interactive checklists belong** (optional). Find `MarkdownView` usages:

   ```bash
   grep -rn "MarkdownView" src app components 2>/dev/null
   ```

   For a detail view where the reader should be able to tick items, wire `onChange` to your existing save path — the string it hands you is the same full Markdown your editor saves:

   ```tsx
   <MarkdownView
     content={task.notes}
     onChange={(md) => saveNotes(task.id, md)} // return the Promise to get busy-state + rollback
   />
   ```

   Return the Promise from your save call if you want the built-in busy state and automatic rollback on failure; return nothing (`void`) if your save is fire-and-forget. **Do not pass `onChange` where the user lacks write access** — `MarkdownView` performs no authorization; it only serializes and reports. The consumer validates and authorizes the write.

8. **Verify.** All three must pass:

   ```bash
   pnpm exec tsc --noEmit
   pnpm test
   pnpm build
   ```

9. **Commit** with a clear message:

   ```
   chore(deps): upgrade @open-elements/ui to 0.10.0

   MarkdownEditor no longer corrupts stored Markdown on open and
   MarkdownView now renders full structure. Declare an explicit toolbar
   on each MarkdownEditor usage; the default dropped to ["bold", "italic"].
   ```

### Guard rails

- **Do not** add a global wrapper that re-injects the old four-button default everywhere — that defeats the point of the change. Decide per field.
- **Do not** try to gate marks (Bold/Italic/…) beyond hiding their buttons; only `taskList` creation is fully gated, by design.
- **Do not** treat missing links/strikethrough buttons as data loss — stored links and strikethrough still render; only the button was removed.
- **Do not** add `@tiptap/*` packages to your app's dependencies to "fix" the upgrade. They are the library's transitive dependencies.
- **Do not** edit `@open-elements/ui` from the consumer side. `prose` overrides belong in your app's markup or stylesheet.
- **Do not** build your own busy/disabled state around `MarkdownView` when you return a Promise — the view already disables its checkboxes while the save is pending.
- **Do not** try to derive "which item changed" yourself — `onChange` already hands you the complete updated Markdown; save it as-is.
- **Do not** pass `onChange` to a read-only audience; omit it to keep checkboxes non-interactive.
- **Do not** expect `MarkdownView` text to become editable — only checkboxes are interactive; it is still not an editor.

### Don't do this

- Do not treat the new rendering as a regression and revert the bump; flattened text was the bug.
- Do not pass `"unlink"` in `toolbar` — it is not an action; Unlink appears automatically next to Link when the cursor is inside a link.
- Do not render your own progress spinner *inside* the checklist expecting the library to place it — the library owns only the disabled state; render saving UI where it belongs on your page.
- Do not bundle unrelated dependency bumps into the same change.
