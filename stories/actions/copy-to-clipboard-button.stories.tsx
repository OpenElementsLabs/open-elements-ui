import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { CopyToClipboardButton } from "../../src/index.ts";

const meta: Meta<typeof CopyToClipboardButton> = {
  title: "Actions/CopyToClipboardButton",
  component: CopyToClipboardButton,
  args: { value: "anna.weber@example.com", title: "Copy email address" },
  argTypes: {
    value: { control: "text", description: "What lands on the clipboard." },
    title: { control: "text" },
  },
  beforeEach: async () => {
    // Writing to the real clipboard needs a permission the story runner does not
    // hold, and the component does not await the write. Stubbing keeps the story
    // deterministic and lets the play function assert what was copied.
    const writeText = fn();
    const original = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    return () => {
      Object.defineProperty(navigator, "clipboard", { value: original, configurable: true });
    };
  },
  parameters: {
    docs: {
      description: {
        component:
          "Copies a string and confirms it by swapping the icon for a tick for two seconds. The " +
          "confirmation is the `success` tone of `ActionIconButton`.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Copy email address" });
    await userEvent.click(button);

    await expect(navigator.clipboard.writeText).toHaveBeenCalledWith("anna.weber@example.com");
    // The icon swap is the only feedback, so assert on it rather than on the call alone.
    await waitFor(() => expect(button.querySelector("svg")).toHaveClass("lucide-check"));
  },
};

export const ResetsAfterTwoSeconds: Story = {
  parameters: {
    docs: {
      description: {
        story: "The tick is temporary — after two seconds the button is ready to be pressed again.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole("button", { name: "Copy email address" });
    await userEvent.click(button);
    await waitFor(() => expect(button.querySelector("svg")).toHaveClass("lucide-check"));
    await waitFor(() => expect(button.querySelector("svg")).toHaveClass("lucide-copy"), {
      timeout: 4000,
    });
  },
};

export const NextToAValue: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <code className="bg-muted rounded px-2 py-1">{args.value}</code>
      <CopyToClipboardButton {...args} />
    </div>
  ),
};
