import type { Meta, StoryObj } from "@storybook/react-vite";
import { CreditCard, Search, Send } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "../../src/index.ts";

const meta: Meta<typeof InputGroup> = {
  title: "Forms/InputGroup",
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component:
          "A field with attachments. `InputGroupAddon` takes an `align` of `inline-start`, " +
          "`inline-end`, `block-start` or `block-end`, and the group reshapes itself around " +
          "whichever are present — focus and error rings included, via `has-[…]` selectors on the " +
          "wrapper rather than props.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <InputGroup {...args} className="max-w-sm">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput placeholder="Search companies" />
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.type(input, "Nordwind");
    await expect(input).toHaveValue("Nordwind");
  },
};

export const InlineEndButton: Story = {
  render: (args) => (
    <InputGroup {...args} className="max-w-sm">
      <InputGroupInput placeholder="Add a comment" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton size="icon-xs" aria-label="Send" onClick={fn()}>
          <Send />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Clicking the addon focuses the field; clicking a button inside it does not.
    await userEvent.click(canvas.getByRole("button", { name: "Send" }));
    await expect(canvas.getByRole("textbox")).not.toHaveFocus();
  },
};

export const TextAddons: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-4">
      <InputGroup {...args}>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder="open-elements.com" />
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupInput placeholder="0.00" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>EUR</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup {...args}>
        <InputGroupAddon>
          <CreditCard />
        </InputGroupAddon>
        <InputGroupInput placeholder="4242 4242 4242 4242" />
        <InputGroupAddon align="inline-end">
          <InputGroupText>Visa</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  ),
};

export const BlockAddons: Story = {
  render: (args) => (
    <InputGroup {...args} className="max-w-sm">
      <InputGroupAddon align="block-start" className="border-b">
        <InputGroupText>Internal note</InputGroupText>
      </InputGroupAddon>
      <InputGroupTextarea placeholder="Visible to your team only" rows={4} />
      <InputGroupAddon align="block-end" className="border-t justify-end">
        <InputGroupButton size="sm" onClick={fn()}>
          Save note
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Block addons stack the group vertically — the layout switch is triggered by the addon's " +
          "`data-align`, not by a prop on the group.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const group = canvasElement.querySelector<HTMLElement>('[data-slot="input-group"]');
    await expect(getComputedStyle(group!).flexDirection).toBe("column");
  },
};

export const Invalid: Story = {
  render: (args) => (
    <InputGroup {...args} className="max-w-sm">
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <InputGroupInput aria-invalid aria-label="Website" defaultValue="not a url" />
    </InputGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The whole group turns destructive when the control inside it is `aria-invalid` — the " +
          "border lives on the wrapper, so it has to react to the child's state.",
      },
    },
  },
};

export const Disabled: Story = {
  render: (args) => (
    <InputGroup {...args} className="max-w-sm" data-disabled="true">
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput disabled aria-label="Search companies" placeholder="Search companies" />
    </InputGroup>
  ),
};
