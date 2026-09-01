import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info } from "lucide-react";
import { expect, screen, userEvent, within } from "storybook/test";
import { Button, Tooltip, TooltipContent, TooltipTrigger } from "../../src/index.ts";
import { expectVisible } from "../support/overlay.ts";

const meta: Meta<typeof Tooltip> = {
  title: "Overlays/Tooltip",
  component: Tooltip,
  parameters: {
    docs: {
      description: {
        component:
          "A hover/focus hint. It must be inside a `TooltipProvider` — Radix throws otherwise — so " +
          "the showcase supplies one globally, exactly as a consuming app does at its root.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="py-16">
      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Exports the current view as CSV</TooltipContent>
      </Tooltip>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByRole("button", { name: "Hover me" }));
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(
      "Exports the current view as CSV",
    );
  },
};

export const OpensOnFocus: Story = {
  render: Default.render,
  parameters: {
    docs: {
      description: {
        story:
          "Keyboard users get the same hint — the trigger reveals it on focus, not just hover.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole("button", { name: "Hover me" }).focus();
    await expectVisible(await screen.findByRole("tooltip"));
  },
};

export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3 py-16">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip {...args} key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" aria-label={side}>
              <Info />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Shown on the {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const OnPlainText: Story = {
  render: (args) => (
    <p className="max-w-md py-16 text-sm">
      The invoice is{" "}
      <Tooltip {...args}>
        <TooltipTrigger asChild>
          <span tabIndex={0} className="underline decoration-dotted underline-offset-4">
            overdue
          </span>
        </TooltipTrigger>
        <TooltipContent>Payment was due 14 days ago</TooltipContent>
      </Tooltip>{" "}
      and a reminder has been sent.
    </p>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Any element can be the trigger via `asChild`, but it has to be focusable or keyboard " +
          "users never see the hint — hence `tabIndex={0}` on the span.",
      },
    },
  },
};
