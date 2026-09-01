import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { ExternalLinkButton } from "../../src/index.ts";

const meta: Meta<typeof ExternalLinkButton> = {
  title: "Actions/ExternalLinkButton",
  component: ExternalLinkButton,
  args: { href: "https://open-elements.com", title: "Open website" },
  argTypes: {
    href: { control: "text" },
    title: { control: "text", description: "Tooltip and accessible name." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Opens a URL in a new tab with `noopener,noreferrer`. It is a button rather than an " +
          "anchor because it is meant to sit inside a clickable row, where a nested link would " +
          "fight the row's own navigation.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: async () => {
    // Stubbed so the play function does not actually spawn a tab.
    const original = window.open;
    window.open = fn() as typeof window.open;
    return () => {
      window.open = original;
    };
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open website" }));
    await expect(window.open).toHaveBeenCalledWith(
      "https://open-elements.com",
      "_blank",
      "noopener,noreferrer",
    );
  },
};

export const NextToAValue: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <span>open-elements.com</span>
      <ExternalLinkButton {...args} />
    </div>
  ),
};
