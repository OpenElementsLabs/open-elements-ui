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

Every release must be published to npm **and** have a corresponding Git tag and GitHub Release.

A release is driven entirely by pushing a `v<version>` tag:
that triggers [`.github/workflows/release.yml`](.github/workflows/release.yml), which verifies,
builds, generates the SBOMs, _stages_ the npm publish and creates a **draft** GitHub Release.
Neither the npm version nor the GitHub Release goes live until a maintainer approves it by hand —
both stay behind the same human 2FA gate.

### Steps

1. **Add an upgrade guide** for user-visible changes as `docs/upgrade-to-<major.minor>.md`,
   following the existing guides, and commit it. Do this before the bump — `pnpm version` needs a
   clean working tree, and the tag must point at a commit that already contains everything.
2. **Verify locally** before tagging — the workflow runs the same checks and a failure means
   re-cutting the tag:

   ```bash
   pnpm install --frozen-lockfile
   pnpm run typecheck && pnpm run lint && pnpm run format:check
   pnpm run test && pnpm run build
   pnpm run sbom && pnpm run sbom:verify
   ```

3. **Bump the version.** On an up-to-date `main`, let `pnpm version` do it. It rewrites
   `package.json`, commits the change and creates the annotated `v<version>` tag in one step, so the
   tag and `package.json` version can never disagree — which is exactly what the workflow verifies:

   ```bash
   pnpm version patch   # 0.9.0 -> 0.9.1
   pnpm version minor   # 0.9.0 -> 0.10.0
   pnpm version major   # 0.9.0 -> 1.0.0
   ```

   Pass an exact version (`pnpm version 0.10.0`) when you do not want a relative bump. Only plain
   `A.B.C` releases are supported — the workflow rejects pre-release tags, so avoid
   `premajor`/`preminor`/`prepatch`/`prerelease`. The default commit message is the bare version
   number; add `--message "chore: release %s"` to match the repository's commit style. `v` is
   already pnpm's default tag prefix and matches the workflow's `v*` trigger.

4. **Push the commit and the tag** — pushing the tag is what starts the release:

   ```bash
   git push --follow-tags origin main
   ```

5. **Watch the workflow.** `gh run watch` (or the Actions tab). It ends with the version in the npm
   staging queue and a draft GitHub Release carrying both SBOMs as assets.
6. **Approve the npm publish** — this is the step that makes the version installable. Either approve
   it on npmjs.com, or:

   ```bash
   pnpm stage list                # find the stage id for the release
   pnpm stage approve <stage-id>  # requires 2FA
   ```

7. **Publish the draft GitHub Release** on GitHub, or with
   `gh release edit v0.10.0 --draft=false`. Review the auto-generated notes first.
8. **Open the next development version** — bump `package.json` to the next planned version with
   `pnpm version <next-version> --no-git-tag-version`, then commit and push to `main`.
   `--no-git-tag-version` is required here: without it pnpm would tag the development bump and
   trigger another release.

### If something goes wrong

- **The workflow fails before `pnpm stage publish`** (checks, build, SBOM): nothing was published.
  Delete the tag, fix the problem, then re-cut the tag on the fixed commit. Do not run
  `pnpm version` again — `package.json` already holds the release version, so tag by hand:

  ```bash
  git tag -d v0.10.0 && git push origin :refs/tags/v0.10.0
  # commit the fix, then:
  git tag -a v0.10.0 -m "0.10.0" && git push origin v0.10.0
  ```

- **The workflow failed after staging**: the version sits unapproved in the npm staging queue. Do
  not approve it — discard the stage on npmjs.com and re-cut the tag as above.
- **Wrong content already approved on npm**: the version is immutable. Do not attempt to reuse it —
  release a patch version instead.
