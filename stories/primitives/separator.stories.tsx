import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Separator } from "../../src/index.ts";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    decorative: {
      control: "boolean",
      description:
        "Decorative separators are hidden from assistive technology. Turn it off when the rule " +
        "genuinely separates two regions.",
    },
  },
  parameters: {
    docs: {
      description: {
        component: "A one-pixel rule. Its thickness swaps axis with `orientation`.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { orientation: "horizontal" },
  render: (args) => (
    <div className="max-w-sm">
      <p className="text-sm font-medium">Contact details</p>
      <Separator {...args} className="my-4" />
      <p className="text-muted-foreground text-sm">anna.weber@example.com</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rule = canvasElement.querySelector<HTMLElement>('[data-slot="separator"]');
    await expect(rule).not.toBeNull();
    await expect(getComputedStyle(rule!).height).toBe("1px");
  },
};

export const Vertical: Story = {
  args: { orientation: "vertical" },
  render: (args) => (
    <div className="flex h-6 items-center gap-4 text-sm">
      <span>Overview</span>
      <Separator {...args} />
      <span>Contacts</span>
      <Separator {...args} />
      <span>Tasks</span>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const rule = canvasElement.querySelector<HTMLElement>('[data-slot="separator"]');
    await expect(getComputedStyle(rule!).width).toBe("1px");
  },
};

export const Semantic: Story = {
  args: { decorative: false },
  render: (args) => (
    <div className="max-w-sm">
      <p className="text-sm">Section one</p>
      <Separator {...args} className="my-4" />
      <p className="text-sm">Section two</p>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Not decorative, so it is exposed as a separator rather than hidden.
    await expect(canvasElement.querySelector('[role="separator"]')).not.toBeNull();
  },
};
