import type { Meta, StoryObj } from "@storybook/react-vite";
import { Archive, Pin, Star } from "lucide-react";
import { expect, fn, userEvent, within } from "storybook/test";
import { ActionIconButton } from "../../src/index.ts";

const meta: Meta<typeof ActionIconButton> = {
  title: "Actions/ActionIconButton",
  component: ActionIconButton,
  args: { title: "Archive", tone: "default", onClick: fn() },
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "success"] },
    title: { control: "text", description: "Becomes both the tooltip and the accessible name." },
    children: { table: { disable: true } },
  },
  render: (args) => (
    <ActionIconButton {...args}>
      <Archive />
    </ActionIconButton>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "A bare icon button for inline row actions. It stops click propagation, so putting one " +
          "inside a clickable table row does not also trigger the row.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const button = within(canvasElement).getByRole("button", { name: "Archive" });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const Tones: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <ActionIconButton {...args} tone="default" title="Not pinned">
        <Pin />
      </ActionIconButton>
      <ActionIconButton {...args} tone="success" title="Pinned">
        <Star />
      </ActionIconButton>
    </div>
  ),
  parameters: {
    controls: { exclude: ["tone", "title"] },
    docs: {
      description: {
        story:
          "`success` is how `CopyToClipboardButton` marks a completed action — the tone is the " +
          "component's whole state vocabulary.",
      },
    },
  },
};

export const InsideAClickableRow: Story = {
  render: (args) => (
    // A table row, not a `role="button"` wrapper: a widget role containing a
    // focusable control is a nested-interactive violation, and a clickable row
    // in a real table is where this component actually lives.
    <table className="max-w-sm text-sm">
      <tbody>
        <tr onClick={fn()} className="hover:bg-muted/50 cursor-pointer border-b">
          <td className="p-3">Open Elements GmbH</td>
          <td className="p-3 text-right">
            <ActionIconButton {...args} title="Archive">
              <Archive />
            </ActionIconButton>
          </td>
        </tr>
      </tbody>
    </table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Clicking the icon archives the row without opening it. That is the reason the component " +
          "calls `stopPropagation` for you.",
      },
    },
  },
  play: async ({ canvasElement, args }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Archive" }));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
