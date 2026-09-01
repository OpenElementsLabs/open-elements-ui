import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleAlert } from "lucide-react";
import { expect, within } from "storybook/test";
import { Input, Label } from "../../src/index.ts";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  args: { children: "Company name" },
  parameters: {
    docs: {
      description: {
        component:
          "A form label. It dims itself when the field it names is disabled — via `peer-disabled:` " +
          "for a sibling control and `group-data-[disabled=true]:` inside a disabled group — so the " +
          "label never looks active next to a dead field.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label {...args} htmlFor="company" />
      <Input id="company" placeholder="Open Elements GmbH" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByLabelText("Company name")).toBeVisible();
  },
};

export const WithIcon: Story = {
  args: { children: undefined },
  render: (args) => (
    <Label {...args}>
      <CircleAlert className="size-4" />
      Required field
    </Label>
  ),
};

export const NextToADisabledField: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      {/* `peer` on the control is what lets the label react to its disabled state. */}
      <Input id="company-disabled" className="peer order-2" disabled placeholder="Locked" />
      <Label {...args} htmlFor="company-disabled" className="order-1" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The dimming rule is `peer-disabled:`, so it only fires when the label follows the " +
          "control in the DOM. Here the visual order is restored with `order-*`.",
      },
    },
  },
};
