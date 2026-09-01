import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { TagForm } from "../../src/index.ts";
import type { TagDto } from "../../src/index.ts";
import { TAGS, TAG_FORM_TRANSLATIONS, delay } from "../support/fixtures.ts";

interface TagFormStoryProps {
  readonly tag?: TagDto;
  readonly latencyMs: number;
  /** Reject the save with `CONFLICT`, which the form turns into a name error. */
  readonly nameTaken: boolean;
}

function TagFormHarness({ tag, latencyMs, nameTaken }: TagFormStoryProps) {
  const [saved, setSaved] = useState<string | null>(null);
  return (
    <div className="grid gap-4">
      <TagForm
        tag={tag}
        translations={{ ...TAG_FORM_TRANSLATIONS, title: tag ? "Edit tag" : "New tag" }}
        onCancel={fn()}
        onSave={async (data) => {
          await delay(latencyMs);
          if (nameTaken) throw new Error("CONFLICT");
          setSaved(JSON.stringify(data));
        }}
      />
      <pre data-testid="saved" className="text-muted-foreground text-xs">
        {saved ?? "not saved yet"}
      </pre>
    </div>
  );
}

const meta: Meta<TagFormStoryProps> = {
  title: "Forms/TagForm",
  render: (args) => <TagFormHarness {...args} />,
  args: { tag: undefined, latencyMs: 400, nameTaken: false },
  argTypes: {
    tag: { table: { disable: true } },
    latencyMs: { control: { type: "range", min: 0, max: 3000, step: 100 } },
    nameTaken: {
      control: "boolean",
      description:
        "Make `onSave` reject with the literal message `CONFLICT` — the only rejection the form " +
        "recognises, which it shows as a name error.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Create or edit a tag. Validation is local: a name is required, and the colour must be a " +
          "six-digit hex, reachable either from the swatch palette or by typing.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<TagFormStoryProps>;

export const Create: Story = {};

export const Edit: Story = {
  args: { tag: TAGS[0] },
  parameters: {
    docs: { description: { story: "Seeded from an existing tag; the matching swatch is ticked." } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText(/Name/)).toHaveValue("Key account");
    await expect(canvas.getByDisplayValue("#5CBA9E")).toBeVisible();
  },
};

export const ValidationErrors: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Submitting an untouched form reports both required fields at once.
    await userEvent.click(canvas.getByRole("button", { name: TAG_FORM_TRANSLATIONS.save }));

    await expect(await canvas.findByText(TAG_FORM_TRANSLATIONS.nameRequired)).toBeVisible();
    await expect(canvas.getByText(TAG_FORM_TRANSLATIONS.colorRequired)).toBeVisible();
    await expect(canvas.getByTestId("saved")).toHaveTextContent("not saved yet");
  },
};

export const InvalidColour: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Name/), "Partner");
    await userEvent.type(
      canvas.getByPlaceholderText(TAG_FORM_TRANSLATIONS.colorPlaceholder),
      "red",
    );
    await userEvent.click(canvas.getByRole("button", { name: TAG_FORM_TRANSLATIONS.save }));

    await expect(await canvas.findByText(TAG_FORM_TRANSLATIONS.colorInvalid)).toBeVisible();
  },
};

export const SaveFromThePalette: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Name/), "Partner");

    // The palette swatches are unlabelled buttons; the third is a warm amber.
    const swatches = canvas
      .getAllByRole("button")
      .filter((b) => b.getAttribute("style")?.includes("background-color"));
    await userEvent.click(swatches[2]);

    // Choosing a swatch fills the hex field, which is the same state the text input writes to.
    await waitFor(() => expect(canvas.getByDisplayValue(/^#/)).toBeVisible());

    await userEvent.click(canvas.getByRole("button", { name: TAG_FORM_TRANSLATIONS.save }));
    await waitFor(() => expect(canvas.getByTestId("saved")).toHaveTextContent('"name":"Partner"'), {
      timeout: 4000,
    });
  },
};

export const NameConflict: Story = {
  args: { nameTaken: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText(/Name/), "Key account");
    await userEvent.type(
      canvas.getByPlaceholderText(TAG_FORM_TRANSLATIONS.colorPlaceholder),
      "#5CBA9E",
    );
    await userEvent.click(canvas.getByRole("button", { name: TAG_FORM_TRANSLATIONS.save }));

    await expect(
      await canvas.findByText(TAG_FORM_TRANSLATIONS.nameConflict, undefined, { timeout: 4000 }),
    ).toBeVisible();
    // The form is usable again, not stuck in its submitting state.
    await expect(canvas.getByRole("button", { name: TAG_FORM_TRANSLATIONS.save })).toBeEnabled();
  },
};
