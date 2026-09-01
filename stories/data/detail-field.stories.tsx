import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { Badge, DetailField } from "../../src/index.ts";
import { DETAIL_FIELD_TRANSLATIONS } from "../support/fixtures.ts";

const meta: Meta<typeof DetailField> = {
  title: "Data/DetailField",
  component: DetailField,
  args: {
    label: "Email",
    value: "anna.weber@example.com",
    translations: DETAIL_FIELD_TRANSLATIONS,
  },
  argTypes: {
    copyable: { control: "boolean" },
    linkable: { control: "boolean" },
    mailable: { control: "boolean" },
    callable: { control: "boolean" },
    multiline: { control: "boolean" },
    translations: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  // The component renders a `<dt>`/`<dd>` pair, which is only valid inside a
  // description list — so every story supplies one.
  decorators: [
    (Story) => (
      <dl className="grid max-w-md gap-4">
        <Story />
      </dl>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "A label/value pair for a detail page, with optional inline actions. The action icons " +
          "only appear when there is a value to act on, so an empty field stays quiet.\n\n" +
          "It renders a bare `<dt>`/`<dd>` pair, so it has to be placed inside a `<dl>` — every " +
          "story here wraps it in one.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Copyable: Story = {
  args: { copyable: true },
  beforeEach: async () => {
    // The real clipboard needs a permission the story runner does not have, and
    // the component does not await the write, so stub it to keep the story
    // deterministic — and to be able to assert what was copied.
    const writeText = fn();
    const original = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    return () => {
      Object.defineProperty(navigator, "clipboard", { value: original, configurable: true });
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getAllByRole("button")[0];

    // The tooltip says "Copy" before anything happens.
    await userEvent.hover(button);
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(
      DETAIL_FIELD_TRANSLATIONS.copy,
    );

    await userEvent.click(button);
    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith("anna.weber@example.com");

    // Confirmation is the icon swapping to a tick for two seconds.
    await waitFor(() => expect(button.querySelector("svg")).toHaveClass("lucide-check"));
    await waitFor(() => expect(button.querySelector("svg")).toHaveClass("lucide-copy"), {
      timeout: 4000,
    });
  },
};

export const AllActions: Story = {
  args: {
    label: "Contact",
    value: "anna.weber@example.com",
    copyable: true,
    linkable: true,
    mailable: true,
    callable: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "All four actions at once. Only the copy action is exercised by a play function — the " +
          "other three navigate the frame or open a tab, which a test cannot undo.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole("button")).toHaveLength(4);
  },
};

export const Empty: Story = {
  args: { value: null, copyable: true, linkable: true },
  parameters: {
    docs: { description: { story: "No value: an em dash, and no actions to press." } },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("—")).toBeVisible();
    await expect(canvas.queryAllByRole("button")).toHaveLength(0);
  },
};

export const Multiline: Story = {
  args: {
    label: "Address",
    value: "Open Elements GmbH\nHauptstraße 12\n10827 Berlin\nGermany",
    multiline: true,
    copyable: true,
  },
  play: async ({ canvasElement }) => {
    const value = within(canvasElement).getByText(/Hauptstraße/);
    await expect(getComputedStyle(value).whiteSpace).toBe("pre-line");
  },
};

export const WithCustomContent: Story = {
  args: { label: "Status", value: "Active", children: undefined },
  render: (args) => (
    <DetailField {...args}>
      <Badge variant="secondary">Active since March 2024</Badge>
    </DetailField>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`children` replaces the rendered value but not the actions — the actions still work off " +
          "`value`, so both are supplied.",
      },
    },
  },
};

export const Group: Story = {
  render: (args) => (
    <>
      <DetailField {...args} label="Company" value="Open Elements GmbH" copyable />
      <DetailField {...args} label="Website" value="open-elements.com" linkable copyable />
      <DetailField {...args} label="Email" value="anna.weber@example.com" mailable copyable />
      <DetailField {...args} label="Phone" value="+49 30 1234567" callable copyable />
      <DetailField {...args} label="VAT ID" value={null} />
    </>
  ),
  parameters: {
    controls: { exclude: ["label", "value", "copyable", "linkable", "mailable", "callable"] },
    docs: {
      description: {
        story: "How the component is actually used: a `<dl>` of fields on a detail page.",
      },
    },
  },
};
