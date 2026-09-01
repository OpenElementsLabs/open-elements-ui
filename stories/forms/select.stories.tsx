import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../../src/index.ts";
import { expectVisible } from "../support/overlay.ts";

const meta: Meta<typeof Select> = {
  title: "Forms/Select",
  component: Select,
  argTypes: {
    disabled: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A single-choice dropdown. The listbox is portalled, so a play function looks for it on " +
          "the screen rather than inside the story canvas.\n\n" +
          '`SelectTrigger` renders a `<button role="combobox">`, and that role does not take its ' +
          "accessible name from its contents — the selected value on screen does **not** name the " +
          "control. Every trigger therefore needs a `<Label htmlFor>` or an `aria-label`, which is " +
          "what `TablePagination` does internally.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="grid max-w-xs gap-2">
      <Label htmlFor="stage">Deal stage</Label>
      <Select {...args}>
        <SelectTrigger id="stage" className="w-[220px]">
          <SelectValue placeholder="Pick a stage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="lead">Lead</SelectItem>
          <SelectItem value="qualified">Qualified</SelectItem>
          <SelectItem value="proposal">Proposal sent</SelectItem>
          <SelectItem value="won">Won</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox");
    await expect(trigger).toHaveTextContent("Pick a stage");

    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole("option", { name: "Proposal sent" }));

    await waitFor(() => expect(trigger).toHaveTextContent("Proposal sent"));
  },
};

export const Grouped: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Team" className="w-[220px]">
        <SelectValue placeholder="Assign to a team" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sales</SelectLabel>
          <SelectItem value="dach">DACH</SelectItem>
          <SelectItem value="nordics">Nordics</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Delivery</SelectLabel>
          <SelectItem value="platform">Platform</SelectItem>
          <SelectItem value="support">Support</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    const listbox = await screen.findByRole("listbox");
    // Group labels are not options, so they cannot be selected by keyboard either.
    await expect(within(listbox).getAllByRole("option")).toHaveLength(4);
    await expectVisible(within(listbox).getByText("Sales"));

    // Leave the story closed: an open Radix overlay marks the rest of the page
    // aria-hidden, which is a false positive for anything auditing afterwards.
    await userEvent.keyboard("{Escape}");
  },
};

export const WithDisabledItem: Story = {
  render: (args) => (
    <Select {...args}>
      <SelectTrigger aria-label="Plan" className="w-[220px]">
        <SelectValue placeholder="Pick a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="starter">Starter</SelectItem>
        <SelectItem value="team">Team</SelectItem>
        <SelectItem value="enterprise" disabled>
          Enterprise (contact sales)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));
    const option = await screen.findByRole("option", { name: /Enterprise/ });
    await expect(option).toHaveAttribute("data-disabled");
    await userEvent.keyboard("{Escape}");
  },
};

export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState("qualified");
    return (
      <div className="grid max-w-xs gap-3">
        <Select {...args} value={value} onValueChange={setValue}>
          <SelectTrigger aria-label="Deal stage" className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="qualified">Qualified</SelectItem>
            <SelectItem value="won">Won</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm" data-testid="selected">
          value: {value}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("selected")).toHaveTextContent("value: qualified");

    await userEvent.click(canvas.getByRole("combobox"));
    await userEvent.click(await screen.findByRole("option", { name: "Won" }));

    await waitFor(() => expect(canvas.getByTestId("selected")).toHaveTextContent("value: won"));
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(["default", "sm"] as const).map((size) => (
        <Select {...args} key={size}>
          <SelectTrigger size={size} className="w-[160px]" aria-label={size}>
            <SelectValue placeholder={size} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Option A</SelectItem>
            <SelectItem value="b">Option B</SelectItem>
          </SelectContent>
        </Select>
      ))}
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Select {...args} defaultValue="lead">
      <SelectTrigger aria-label="Deal stage" className="w-[220px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="lead">Lead</SelectItem>
      </SelectContent>
    </Select>
  ),
};
