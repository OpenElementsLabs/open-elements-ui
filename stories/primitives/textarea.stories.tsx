import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Label, Textarea } from "../../src/index.ts";

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Textarea",
  component: Textarea,
  args: { placeholder: "Add a note…" },
  argTypes: {
    disabled: { control: "boolean" },
    rows: { control: { type: "number", min: 1, max: 20 } },
    "aria-invalid": { control: "boolean", name: "aria-invalid" },
  },
  render: (args) => <Textarea {...args} className="max-w-sm" />,
  parameters: {
    docs: {
      description: {
        component:
          "A multi-line field. It sets `field-sizing-content`, so in browsers that support it the " +
          "box grows with the text instead of scrolling.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const GrowsWithContent: Story = {
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole("textbox");
    const before = textarea.getBoundingClientRect().height;
    await userEvent.type(textarea, "one{Enter}two{Enter}three{Enter}four{Enter}five");
    await expect(textarea.getBoundingClientRect().height).toBeGreaterThan(before);
  },
  parameters: {
    docs: {
      description: {
        story: "Typing five lines makes the box taller — no `rows` juggling in the consuming app.",
      },
    },
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="note">Internal note</Label>
      <Textarea {...args} id="note" />
    </div>
  ),
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "Too short" },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "This note cannot be edited." },
};
