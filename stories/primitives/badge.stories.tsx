import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, CircleAlert } from "lucide-react";
import { expect, within } from "storybook/test";
import { Badge } from "../../src/index.ts";

const VARIANTS = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  args: { children: "Active" },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    asChild: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A small status pill. Renders a `<span>` by default; `asChild` swaps in an anchor, and " +
          "the hover styles are written with `[a&]:` so they only apply once it is a link.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      {VARIANTS.map((variant) => (
        <Badge key={variant} {...args} variant={variant}>
          {variant}
        </Badge>
      ))}
    </div>
  ),
  parameters: { controls: { exclude: ["variant", "children"] } },
};

export const WithIcon: Story = {
  args: { children: undefined },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Badge {...args}>
        <Check />
        Verified
      </Badge>
      <Badge {...args} variant="destructive">
        <CircleAlert />
        Overdue
      </Badge>
    </div>
  ),
};

export const AsLink: Story = {
  args: { asChild: true, variant: "outline", children: undefined },
  render: (args) => (
    <Badge {...args}>
      <a href="https://open-elements.com" target="_blank" rel="noopener noreferrer">
        Documentation
      </a>
    </Badge>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("link")).toHaveAttribute("data-slot", "badge");
  },
};
