import type { MouseEvent, ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Pencil, Trash2 } from "lucide-react";
import { expect, fn, screen, userEvent, within } from "storybook/test";
import { TooltipIconButton } from "../../src/index.ts";

/**
 * `TooltipIconButtonProps` is a union discriminated by `asChild`, which
 * collapses to `never` when Storybook derives args from it. The catalogue
 * declares the button-shaped half explicitly; the `asChild` half gets its own
 * story that builds the element directly.
 */
interface TooltipIconButtonArgs {
  readonly tooltip: string;
  readonly tone?: "default" | "destructive";
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  readonly onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const meta: Meta<TooltipIconButtonArgs> = {
  title: "Actions/TooltipIconButton",
  args: { tooltip: "Edit", tone: "default", onClick: fn(), icon: <Pencil /> },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "destructive"] },
    tooltip: {
      control: "text",
      description: "Used as both the tooltip text and the button's accessible name.",
    },
    disabled: { control: "boolean" },
    icon: { table: { disable: true } },
    onClick: { table: { disable: true } },
  },
  render: (args) => <TooltipIconButton {...args} icon={args.icon} onClick={args.onClick} />,
  parameters: {
    docs: {
      description: {
        component:
          "A ghost icon button that always carries a tooltip. Two shapes: pass an `icon` and an " +
          "`onClick`, or pass `asChild` with your own element — a link, typically.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<TooltipIconButtonArgs>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Edit" });

    // Hover first: Radix dismisses the tooltip on click and keeps it closed
    // until the pointer leaves and comes back.
    await userEvent.hover(button);
    await expect(await screen.findByRole("tooltip")).toHaveTextContent("Edit");

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Destructive: Story = {
  args: { tone: "destructive", tooltip: "Delete", icon: <Trash2 /> },
};

export const Disabled: Story = {
  args: { disabled: true },
  parameters: {
    docs: {
      description: {
        story:
          "A disabled button swallows pointer events, which would normally kill the tooltip too — " +
          "so the component wraps the trigger in a span to keep the hint reachable.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Edit" });
    await expect(button).toBeDisabled();

    // The tooltip still opens, because the wrapper span is what the trigger listens on.
    await userEvent.hover(button.parentElement!);
    await expect(await screen.findByRole("tooltip")).toHaveTextContent("Edit");
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const AsLink: Story = {
  render: () => (
    <TooltipIconButton asChild tooltip="Open in a new tab">
      <a href="https://open-elements.com" target="_blank" rel="noopener noreferrer">
        <Pencil />
      </a>
    </TooltipIconButton>
  ),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          "`asChild` keeps link semantics — it is still an anchor with an `href`, just wearing the " +
          "ghost icon button's styling and its tooltip.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole("link", { name: "Open in a new tab" });
    await expect(link).toHaveAttribute("href", "https://open-elements.com");
  },
};

export const Row: Story = {
  render: () => (
    <div className="flex items-center gap-1">
      <TooltipIconButton tooltip="Edit" icon={<Pencil />} onClick={fn()} />
      <TooltipIconButton tone="destructive" tooltip="Delete" icon={<Trash2 />} onClick={fn()} />
    </div>
  ),
  parameters: { controls: { disable: true } },
};
