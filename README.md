# @open-elements/ui

Reusable UI components, brand styling, and translation strings for Open Elements projects.

## Overview

This package contains extracted UI components from the Open CRM frontend, designed to be shared across Open Elements projects. It ships raw `.tsx` source files — the consuming app compiles them as part of its own build.

## Components

- **Button** — Primary action button with variant and size support
- **Input** — Text input field
- **Textarea** — Multi-line text area
- **InputGroup** — Composite input with addons and buttons
- **Combobox** — Searchable dropdown with chip support (based on Base UI)
- **TagMultiSelect** — Multi-select tag picker with colored chips
- **MarkdownEditor** — WYSIWYG Markdown editor that round-trips all supported Markdown constructs without data loss; toolbar actions are configurable per usage via the `toolbar` prop
- **MarkdownView** — Read-only Markdown renderer with structural output (headings, lists, task lists, blockquotes, code); task-list checkboxes become interactive via an optional `onChange` (optimistic update with rollback)

## Usage

```typescript
import { Button, Input, Combobox, TagMultiSelect, cn } from "@open-elements/ui";
import type { TagDto } from "@open-elements/ui";
```

## Brand Styling

Import brand CSS in your app's stylesheet:

```css
@import "@open-elements/ui/src/styles/brand.css";
```

Because this package ships raw `.tsx`, its utility classes reach your app as source text. Tailwind
only turns them into CSS if it scans the library, so the consuming app must point at it and load the
typography plugin that `MarkdownView` relies on:

```css
@import "tailwindcss";
@import "@open-elements/ui/src/styles/brand.css";
@plugin "@tailwindcss/typography";
@import "tw-animate-css";
@source "../node_modules/@open-elements/ui/src";
```

Each line is load-bearing:

- **`@source`** — this package ships raw `.tsx`, so its utility classes reach your app as source
  text. Without the scan they never become CSS, and components render unstyled: task list
  checkboxes pick up a `prose` bullet, for instance.
- **`@tailwindcss/typography`** — `MarkdownView` and `MarkdownEditor` hardcode `prose prose-sm`.
- **`tw-animate-css`** — every overlay (`Dialog`, `AlertDialog`, `Sheet`, `Popover`, `Select`,
  `Combobox`, `Tooltip`) writes its enter and exit states with `animate-in`, `fade-in-0`,
  `zoom-in-95` and `slide-in-from-*`, none of which are Tailwind core utilities.

The [component showcase](#component-showcase) uses exactly this configuration and asserts the
result, so a break in this contract surfaces there.

## Translations

```typescript
import { de, en } from "@open-elements/ui";
```

## Component Showcase

Every component can be opened in isolation, with its props adjustable at runtime, in a Storybook
catalogue:

```bash
pnpm storybook        # dev server on http://localhost:6006
pnpm build-storybook  # static build into storybook-static/
```

Stories live in [`stories/`](stories/), deliberately outside `src/`: `files` in `package.json`
publishes all of `src/`, so a colocated story would ship in the tarball and break a consumer's `tsc`
on unresolvable `@storybook/*` imports. Nothing under `src/` imports Storybook, and Tailwind is a
devDependency that no build script consumes — the published package is unaffected.

Stories carry `play` functions, which run in a real browser and cover what jsdom can only check
indirectly: the toolbar allowlist, the task-list creation gate under actual keystrokes, the
checkbox lifecycle after actual clicks, and that the Tailwind utilities the components rely on
resolve to real styles. They are additive; the vitest suites are unchanged.

Every exported component has stories, grouped in the sidebar as Primitives, Forms, Overlays, Data,
Actions, Navigation and Markdown.

Rendering the library for real turned up defects the unit tests cannot see — an undefined
`--radius`, a non-existent `text-oe-gray`, unlabelled icon buttons and a set of brand tokens that
miss WCAG AA. They are catalogued in [docs/showcase-findings.md](docs/showcase-findings.md); none
have been changed in `src/`.

Deployment of the showcase is documented in
[docs/showcase-deployment.md](docs/showcase-deployment.md).

## Software Bill of Materials (SBOM)

Every release publishes two [CycloneDX](https://cyclonedx.org/) 1.7 SBOMs as assets on its
[GitHub Release](https://github.com/OpenElementsLabs/open-elements-ui/releases), so a specific
published version can be obtained without an `npm install`:

| Asset               | Contents                                                               | Authoritative?                                                     |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `sbom.cdx.json`     | Runtime dependencies (transitive) plus the library's peer dependencies | **Yes** — use this for supplier assessments (Cyber Resilience Act) |
| `sbom-dev.cdx.json` | The build toolchain (`devDependencies`)                                | No — provided for transparency only                                |

Both are generated locally with the pinned `pnpm` (`pnpm sbom`) and verified in CI on every pull
request, so a dependency change that breaks the SBOM turns the build red. A release cannot ship without
a valid SBOM.

```bash
pnpm sbom          # writes sbom/sbom.cdx.json and sbom/sbom-dev.cdx.json (gitignored)
pnpm sbom:verify   # validates both against the CycloneDX 1.7 schema and package.json
```

**Peer dependencies.** `radix-ui`, `@base-ui/react`, `lucide-react`, `react` and `react-dom` are peer
dependencies: the consumer supplies them. `pnpm sbom` alone omits them, so they are added to
`sbom.cdx.json` and marked with a `cdx:npm:peer` property holding the declared range. The **version**
recorded for each peer is the one resolved in _this repository's_ lockfile, not the one a consumer
installs — it changes when we bump our own devDependencies, even though nothing changes for the
consumer. Read a peer's `cdx:npm:peer` range, not its pinned version, as the requirement.

## Releasing a New Version

Pushing a `v<version>` tag triggers [`.github/workflows/release.yml`](.github/workflows/release.yml).
It runs the CI checks, generates the SBOMs, _stages_ the npm publish and creates a **draft** GitHub
Release. Nothing goes live until a maintainer approves both by hand (2FA).

`package.json` always holds the last released version.

1. **Check the upgrade guide.** Every user-visible change since the last release must be covered by
   `docs/upgrade-to-<major.minor>.md` for the version you are about to release — review
   `git log v<last-version>..HEAD` against it. Commit the guide before bumping.
2. **Bump the version** on an up-to-date, clean `main`. This commits the new version and creates the
   matching tag in one step; only plain `A.B.C` versions are accepted:

   ```bash
   pnpm version minor --message "chore: release %s"
   ```

3. **Push** — the tag starts the release:

   ```bash
   git push --follow-tags origin main
   ```

4. **Approve the npm publish** once the workflow is green, on npmjs.com or with
   `pnpm stage list` and `pnpm stage approve <stage-id>`.
5. **Publish the draft GitHub Release** after reviewing its generated notes.

### If something goes wrong

- **Workflow failed, nothing staged:** delete the tag, commit the fix, and tag again by hand —
  `package.json` already holds the release version, so do not run `pnpm version` again:

  ```bash
  git tag -d v<version> && git push origin :refs/tags/v<version>
  # commit the fix, then:
  git tag -a v<version> -m "<version>" && git push origin v<version>
  ```

- **Workflow failed after staging:** discard the stage on npmjs.com, then re-cut the tag as above.
- **Wrong content already approved on npm:** published versions are immutable — release a patch
  version instead.
