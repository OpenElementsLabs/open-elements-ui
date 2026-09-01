import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { HealthStatus } from "../../src/index.ts";
import { HEALTH_STATUS_TRANSLATIONS } from "../support/fixtures.ts";

const meta: Meta<typeof HealthStatus> = {
  title: "Data/HealthStatus",
  component: HealthStatus,
  args: { healthy: true, translations: HEALTH_STATUS_TRANSLATIONS },
  argTypes: {
    healthy: { control: "boolean" },
    translations: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A card reporting whether the backend answers. The dot is decorative on its own, so it " +
          "carries the status text as its label rather than relying on colour alone.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Healthy: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(HEALTH_STATUS_TRANSLATIONS.statusUp)).toBeVisible();
    // Colour is not the only carrier of the state.
    await expect(canvas.getByLabelText(HEALTH_STATUS_TRANSLATIONS.statusUp)).toBeVisible();
  },
};

export const Unhealthy: Story = {
  args: { healthy: false },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(HEALTH_STATUS_TRANSLATIONS.statusDown),
    ).toBeVisible();
  },
};

export const BothStates: Story = {
  render: (args) => (
    <div className="grid gap-4 sm:grid-cols-2">
      <HealthStatus {...args} healthy />
      <HealthStatus {...args} healthy={false} />
    </div>
  ),
  parameters: { controls: { exclude: ["healthy"] } },
};
