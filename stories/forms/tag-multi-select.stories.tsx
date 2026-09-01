import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Label, TagMultiSelect } from "../../src/index.ts";
import type { TagOption } from "../../src/index.ts";
import { TAG_MULTI_SELECT_TRANSLATIONS, TAG_OPTIONS, delay } from "../support/fixtures.ts";
import { expectVisible } from "../support/overlay.ts";

interface TagStoryProps {
  readonly initialSelectedIds: readonly string[];
  readonly latencyMs: number;
  readonly options: readonly TagOption[];
}

function TagMultiSelectHarness({ initialSelectedIds, latencyMs, options }: TagStoryProps) {
  const [selectedIds, setSelectedIds] = useState<readonly string[]>(initialSelectedIds);

  async function loadTags(): Promise<TagOption[]> {
    await delay(latencyMs);
    return [...options];
  }

  return (
    <div className="grid max-w-sm gap-2">
      <Label>Tags</Label>
      <TagMultiSelect
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        loadTags={loadTags}
        translations={TAG_MULTI_SELECT_TRANSLATIONS}
      />
      <p className="text-muted-foreground text-sm" data-testid="selected">
        {selectedIds.length > 0 ? selectedIds.join(", ") : "nothing selected"}
      </p>
    </div>
  );
}

const meta: Meta<TagStoryProps> = {
  title: "Forms/TagMultiSelect",
  render: (args) => <TagMultiSelectHarness {...args} />,
  args: { initialSelectedIds: ["t-1"], latencyMs: 250, options: TAG_OPTIONS },
  argTypes: {
    initialSelectedIds: { control: "check", options: TAG_OPTIONS.map((o) => o.value) },
    latencyMs: {
      control: { type: "range", min: 0, max: 3000, step: 50 },
      description: "How long `loadTags` takes. The field renders before the options arrive.",
    },
    options: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A chips picker over tags loaded asynchronously. Each chip is painted with the tag's own " +
          "hex colour and an automatically chosen foreground, so a pale tag stays readable. An " +
          "invalid colour falls back to grey.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<TagStoryProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The pre-selected chip only appears once loadTags resolves.
    await waitFor(() => expect(canvas.getByText("Key account")).toBeVisible());

    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: /Prospect/ }));

    await waitFor(() => expect(canvas.getByTestId("selected")).toHaveTextContent("t-1, t-2"));
  },
};

export const ContrastAcrossColours: Story = {
  args: { initialSelectedIds: TAG_OPTIONS.map((o) => o.value) },
  parameters: {
    docs: {
      description: {
        story:
          "Every fixture tag at once: a dark green, a mid blue, a pink, a very light yellow that " +
          "must flip to dark text, and one with a malformed colour that falls back to grey.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByText("Newsletter")).toBeVisible());

    // The light yellow chip gets dark text rather than the default white.
    await expect(canvas.getByText("Newsletter").closest("[data-slot=combobox-chip]")).toHaveStyle({
      color: "#1A1A1A",
    });

    // The malformed colour falls back to grey rather than rendering transparent.
    const fallback = canvas
      .getByText("Unclassified")
      .closest("[data-slot=combobox-chip]") as HTMLElement;
    await expect(fallback.style.backgroundColor).not.toBe("");
  },
};

export const Empty: Story = {
  args: { options: [], initialSelectedIds: [] },
  parameters: {
    docs: {
      description: {
        story:
          "No tags exist yet, so the dropdown explains how to get one instead of showing a blank box.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    await expectVisible(await screen.findByText(TAG_MULTI_SELECT_TRANSLATIONS.empty));
  },
};

export const SlowLoad: Story = {
  args: { latencyMs: 2500, initialSelectedIds: ["t-1", "t-3"] },
  parameters: {
    docs: {
      description: {
        story:
          "A deliberately slow `loadTags`. Note that the selected chips are derived from the " +
          "loaded options, so the field looks empty until the request lands — worth knowing when " +
          "a consuming app renders this on a detail page.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Selected ids are already set, yet nothing is shown yet.
    await expect(canvas.getByTestId("selected")).toHaveTextContent("t-1, t-3");
    await expect(canvas.queryByText("Key account")).toBeNull();

    await waitFor(() => expect(canvas.getByText("Key account")).toBeVisible(), { timeout: 6000 });
  },
};
