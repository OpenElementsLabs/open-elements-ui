import type { Meta, StoryObj } from "@storybook/react-vite";
import { Check, Download, Trash2 } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { Button } from "../../src/index.ts";

const VARIANTS = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;
const SIZES = ["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const;

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Save changes", onClick: fn() },
  argTypes: {
    variant: { control: "select", options: VARIANTS },
    size: { control: "select", options: SIZES },
    disabled: { control: "boolean" },
    asChild: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "The base button. `variant` and `size` come from a `cva` recipe, and both are mirrored " +
          "onto `data-variant` / `data-size` so a consuming app can target them from CSS.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await expect(button).toHaveAttribute("data-variant", "default");
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
  parameters: { controls: { exclude: ["variant", "children"] } },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {SIZES.map((size) => (
        <Button key={size} {...args} size={size} aria-label={size}>
          {size.startsWith("icon") ? <Download /> : size}
        </Button>
      ))}
    </div>
  ),
  parameters: { controls: { exclude: ["size", "children"] } },
};

export const WithIcon: Story = {
  args: { children: undefined },
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      <Button {...args}>
        <Download />
        Download
      </Button>
      <Button {...args} variant="destructive">
        <Trash2 />
        Delete
      </Button>
      <Button {...args} variant="outline">
        <Check />
        Approve
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "An svg child is sized to 1rem and the horizontal padding tightens automatically — the " +
          "recipe does it with `has-[>svg]:px-3`, so no extra prop is needed.",
      },
    },
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Save changes" });
    await expect(button).toBeDisabled();
    // The recipe also removes pointer events, so a click never reaches the
    // handler in the first place. (That is why `TooltipIconButton` has to wrap a
    // disabled trigger in a span to keep its tooltip working.)
    await expect(getComputedStyle(button).pointerEvents).toBe("none");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const AsChild: Story = {
  args: { asChild: true, children: undefined },
  render: (args) => (
    <Button {...args}>
      <a href="https://open-elements.com" target="_blank" rel="noopener noreferrer">
        A link that looks like a button
      </a>
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`asChild` renders the styling onto the child element instead of a `<button>`, which is " +
          "how a link keeps link semantics while looking like a button.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link");
    await expect(link).toHaveAttribute("data-slot", "button");
    await expect(canvasElement.querySelector("button")).toBeNull();
  },
};
