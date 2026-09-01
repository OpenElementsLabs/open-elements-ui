import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitForElementToBeRemoved, within } from "storybook/test";
import {
  Button,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "../../src/index.ts";
import { expectVisible } from "../support/overlay.ts";

const meta: Meta<typeof Popover> = {
  title: "Overlays/Popover",
  component: Popover,
  parameters: {
    docs: {
      description: {
        component:
          "A non-modal panel anchored to its trigger. Positioning is Radix's; the component only " +
          "supplies the surface, a default width of 18rem and the side-aware enter animation.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Popover {...args}>
      <PopoverTrigger asChild>
        <Button variant="outline">Set dimensions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Applied to the selected block.</PopoverDescription>
        </PopoverHeader>
        <div className="mt-4 grid gap-2">
          <Label htmlFor="popover-width">Width</Label>
          <Input id="popover-width" defaultValue="320" />
        </div>
      </PopoverContent>
    </Popover>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("button", { name: "Set dimensions" });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(trigger);
    const content = await screen.findByText("Dimensions");
    await expectVisible(content);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");
    await waitForElementToBeRemoved(() => screen.queryByText("Dimensions"));
  },
};

export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3 py-24">
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover {...args} key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline">{side}</Button>
          </PopoverTrigger>
          <PopoverContent side={side} aria-label={`Anchored ${side}`} className="w-48">
            <PopoverDescription>Anchored to the {side}.</PopoverDescription>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "right" }));
    const content = await screen.findByText("Anchored to the right.");
    // Radix records the resolved side, which may flip if there is no room.
    await expect(content.closest("[data-side]")).toHaveAttribute("data-side");
  },
};

export const Controlled: Story = {
  args: { open: true },
  argTypes: { open: { control: "boolean" } },
  render: (args) => (
    <div className="py-24">
      <Popover {...args}>
        <PopoverTrigger asChild>
          <Button variant="outline">Controlled</Button>
        </PopoverTrigger>
        <PopoverContent aria-label="Controlled popover">
          <PopoverDescription>Toggle the `open` arg to show and hide this.</PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
