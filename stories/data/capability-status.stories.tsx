import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import { CapabilityStatus } from "../../src/index.ts";

const meta: Meta<typeof CapabilityStatus> = {
  title: "Data/CapabilityStatus",
  component: CapabilityStatus,
  args: {
    available: true,
    label: "Automatic translation",
    availableText: "Configured and reachable",
    unavailableText: "No API key configured",
  },
  argTypes: {
    available: { control: "boolean" },
    hint: {
      control: "text",
      description:
        "Optional explanation. Supplying it wraps the row in a tooltip and makes it focusable, so " +
        "keyboard users can reach the explanation too.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Reports whether an optional backend feature is switched on. The icon changes shape as " +
          "well as colour — a tick versus a warning triangle — so the state survives without colour.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Available: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("Configured and reachable")).toBeVisible();
  },
};

export const Unavailable: Story = {
  args: { available: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("No API key configured")).toBeVisible();
  },
};

export const WithHint: Story = {
  args: {
    available: false,
    hint: "Set TRANSLATION_API_KEY in the backend environment and restart the service.",
  },
  play: async ({ canvasElement }) => {
    const note = within(canvasElement).getByRole("note");
    // The row announces the label, the state and the hint in one accessible name.
    await expect(note).toHaveAccessibleName(/Automatic translation: No API key configured\./);

    await userEvent.hover(note);
    await expect(await screen.findByRole("tooltip")).toHaveTextContent("TRANSLATION_API_KEY");
  },
};

export const Grid: Story = {
  render: (args) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <CapabilityStatus
        {...args}
        available
        label="Automatic translation"
        availableText="Configured and reachable"
        unavailableText="No API key configured"
      />
      <CapabilityStatus
        {...args}
        available={false}
        label="Outbound email"
        availableText="SMTP reachable"
        unavailableText="SMTP host unreachable"
        hint="Check SMTP_HOST and the firewall rule for port 587."
      />
    </div>
  ),
  parameters: { controls: { exclude: ["available", "label", "availableText", "unavailableText"] } },
};
