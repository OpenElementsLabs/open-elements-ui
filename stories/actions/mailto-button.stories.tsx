import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { MailtoButton } from "../../src/index.ts";

const meta: Meta<typeof MailtoButton> = {
  title: "Actions/MailtoButton",
  component: MailtoButton,
  args: { email: "anna.weber@example.com", title: "Send an email" },
  argTypes: {
    email: { control: "text" },
    title: { control: "text", description: "Tooltip and accessible name." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Hands the address to the operating system by assigning `window.location.href`. There is " +
          "no play function that clicks it: the assignment navigates the story frame, and unlike " +
          "`window.open` it cannot be stubbed. Press it yourself to see your mail client open.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    // Render-only: the button is reachable by its accessible name.
    await expect(
      within(canvasElement).getByRole("button", { name: "Send an email" }),
    ).toBeVisible();
  },
};

export const NextToAValue: Story = {
  render: (args) => (
    <div className="flex items-center gap-2 text-sm">
      <span>{args.email}</span>
      <MailtoButton {...args} />
    </div>
  ),
};
