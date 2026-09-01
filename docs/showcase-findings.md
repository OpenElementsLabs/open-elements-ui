# What the showcase found

Rendering every component with a real Tailwind build, driving it in a real browser and running axe
over each story turned up a set of defects that neither the vitest suites nor the type checker can
see. None of them are showcase bugs — they are what the consuming applications are already shipping.

Nothing here has been changed in `src/`. This is the list, with what it would take to fix each one.

Reproduce with `pnpm storybook` and the **Accessibility** panel, or `pnpm build-storybook` and run
axe over the static build.

## Styling

### `--radius` is referenced but never defined

`input-group.tsx` sizes two recipes with `rounded-[calc(var(--radius)-5px)]`
(`inputGroupAddonVariants`, `inputGroupButtonVariants`). Tailwind v4 ships `--radius-xs` through
`--radius-xl`, but not a bare `--radius`, and `src/styles/brand.css` does not define one either. The
`calc()` is therefore invalid and the whole `border-radius` declaration is dropped — those corners
are square, not rounded.

*Fix:* add `--radius: 0.625rem` (the shadcn default) to the `@theme` block in `brand.css`.

### `text-oe-gray` is not a token

`tag-chips.tsx` styles its optional heading with `text-oe-gray`. The palette defines `oe-gray-mid`
and `oe-gray-light`; there is no `oe-gray`. The class compiles to nothing, so the heading inherits
whatever colour surrounds it.

*Fix:* `text-oe-gray-mid`, or define the token.

### Overlay animations need a plugin the library does not declare

Every overlay — `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Select`, `Combobox`, `Tooltip` — writes
its enter and exit states with `animate-in`, `animate-out`, `fade-in-0`, `zoom-in-95` and
`slide-in-from-*`. None of those are Tailwind core utilities; they come from `tw-animate-css`
(`tailwindcss-animate` on v3). Without it the overlays still work, but appear and disappear
instantly, and a `Sheet` never slides.

The showcase imports `tw-animate-css` in `.storybook/preview.css`. A consuming app has to do the
same — it is as much a precondition as the `@source` line, and it is not written down anywhere.

## Colour contrast

77 contrast violations across 26 components, almost all of them tracing back to three token
choices. Measured against WCAG AA for normal text (4.5:1):

| Pair | Ratio | Verdict |
|---|---|---|
| `muted-foreground` / `oe-gray-mid` `#b0aea5` on `background` | 2.22:1 | fails |
| `primary-foreground` on `primary` `#5cba9e` | 2.34:1 | fails |
| `oe-green` `#5cba9e` as text on `background` | 2.34:1 | fails |
| `destructive` / `oe-red` `#e63277`, either direction | 4.13:1 | large text only |

`muted-foreground` is the widest-reaching of the three. It is the colour of `CardDescription`,
`TableCaption`, `Select` placeholders, `Calendar` weekday headers, `InputGroup` addon text,
`TablePagination`'s counts, `DetailField`'s `<dt>` labels, `CapabilityStatus`'s status line and
`UserMultiSelect`'s placeholder — all of it currently below the threshold.

*Fix:* darken `--color-muted-foreground` (around `#6f6d66` reaches 4.5:1 on white), and either
darken `--color-primary` or stop putting white text on it. `destructive` clears AA for large text
only, so it is fine on a heading and not on a 14px error message — `TagForm`'s validation messages
use it at `text-sm`.

### The contrast helper is not a contrast calculation

`tag-chips.tsx`, `tag-multi-select.tsx` and `tag-form.tsx` each carry the same `getContrastColor`:

```ts
const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
return luminance > 0.5 ? "#1A1A1A" : "#FFFFFF";
```

That is a perceived-brightness threshold, not a WCAG contrast ratio. It gets the extremes right —
`#F1E34B` correctly gets dark text at 13.12:1 — but a mid-tone lands on white text that fails: the
`#5CBA9E` chip comes out at 2.34:1 and `#E63277` at 4.13:1.

*Fix:* pick whichever of black and white has the higher computed ratio against the background, using
relative luminance as WCAG defines it. Worth extracting to `lib/` while doing it — the function is
currently copy-pasted three times, along with `isValidHex`.

`UserAvatar` has the same problem from a fixed palette: white initials on `bg-green-500` (2.28:1),
`bg-teal-500` (2.49:1) and `bg-orange-500` (2.80:1) all fail. The palette needs the 600 or 700
shades.

## Accessible names

25 `button-name` violations. Every one is an icon-only button whose only description is a tooltip —
and a Radix tooltip supplies `aria-describedby` when it opens, never an accessible name. To a screen
reader these are unlabelled buttons.

| Component | Buttons |
|---|---|
| `DetailField` | copy, open, email, call — all four |
| `TagForm` | the twelve palette swatches |
| `Combobox` | `ComboboxTrigger` and `ComboboxChipRemove` (so also `TagMultiSelect`) |
| `UserMultiSelect` | the popover trigger |
| `Sidebar` / `UserSection` | the avatar button |

*Fix:* `aria-label` on each, reusing the text already passed for the tooltip. `TooltipIconButton`
already does exactly this and is the model to follow.

### `SelectTrigger` cannot be named by its contents

`SelectTrigger` renders `<button role="combobox">`, and `combobox` is not a role that takes its
accessible name from its content. The selected value shown on screen does **not** name the control:
without a `<Label htmlFor>` or an `aria-label` the trigger is anonymous.

`TablePagination` sets `aria-label` on its trigger, so the constraint is known internally — it is
just not documented, and it caught the showcase's own stories twice. `UserMultiSelect`'s trigger
carries `role="combobox"` for the same reason and has the same gap.

*Fix:* document the requirement; add `aria-label` to `UserMultiSelect`'s trigger.

### `UserMultiSelect`'s popover has no name

`PopoverContent` renders `role="dialog"`, which requires an accessible name. The picker's popover has
none.

*Fix:* `aria-label` on the `PopoverContent`.

## ARIA correctness

### `HealthStatus` puts `aria-label` on a plain `<span>`

```tsx
<span className={`… ${healthy ? "bg-oe-green" : "bg-oe-red"}`} aria-label={statusText} />
```

`aria-label` is prohibited on an element with no role (or a generic one) and is ignored. The intent —
not relying on colour alone — is right; the mechanism does not work. The status text does happen to
be rendered next to the dot as well, so nothing is actually lost today.

*Fix:* `role="img"` alongside the label, or drop the attribute and mark the dot `aria-hidden` since
the text is already there.

### `Table`'s scroll container is not reachable by keyboard

`Table` wraps itself in `<div class="relative w-full overflow-x-auto">`. When the table is wider
than its container, that region scrolls — but it has no `tabindex`, so a keyboard user cannot scroll
it and cannot reach the columns on the right.

*Fix:* `tabIndex={0}` on the container, plus a `role="region"` and a label.

### An empty `TagMultiSelect` breaks its own popup

With no options loaded the component renders a bare `<p>` where the `ComboboxList` would go. The
popup keeps its listbox semantics without the children they require, and axe reports a missing
required ARIA attribute.

*Fix:* render the empty message through `ComboboxEmpty`, which exists for this and is already
exported.

## Not a defect, but worth knowing

- **`SidebarHeader` links to `/oe-logo-landscape-dark.svg`.** The path is absolute and app-served;
  the library does not ship the asset. In the showcase the image is simply broken.
- **`LanguageSwitch` only works on a dark ground.** Its inactive state is `text-oe-white/70`, so on a
  light surface it is invisible. There is a story that shows this deliberately.
- **`TagMultiSelect` derives its chips from the loaded options**, so a field with `selectedIds`
  already set renders empty until `loadTags` resolves. On a slow connection a detail page shows no
  tags for as long as that takes.
- **`DialogFooter`'s built-in close button** renders the Radix primitive directly rather than the
  exported `DialogClose`, so unlike every other close control it carries no `data-slot="dialog-close"`.
