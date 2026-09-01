import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { LanguageSwitch, useLanguage } from "../../src/index.ts";

function CurrentLanguage() {
  const { language } = useLanguage();
  return (
    <p className="text-muted-foreground text-sm" data-testid="language">
      language: {language}
    </p>
  );
}

const meta: Meta<typeof LanguageSwitch> = {
  title: "Navigation/LanguageSwitch",
  component: LanguageSwitch,
  render: () => (
    // The switch is styled for the dark sidebar it lives in, so it needs a dark
    // ground to be legible at all.
    <div className="bg-oe-dark flex flex-col gap-3 rounded-md p-4">
      <LanguageSwitch />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "A DE/EN toggle wired straight into `LanguageProvider` — it takes no props. The active " +
          "language is written to `localStorage`, so the choice survives a reload. Its colours " +
          "assume the dark sidebar background it is normally rendered on.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SwitchingLanguage: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="bg-oe-dark w-fit rounded-md p-4">
        <LanguageSwitch />
      </div>
      <CurrentLanguage />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The showcase's provider is pinned to English.
    await expect(canvas.getByTestId("language")).toHaveTextContent("language: en");

    await userEvent.click(canvas.getByRole("button", { name: "DE" }));
    await waitFor(() => expect(canvas.getByTestId("language")).toHaveTextContent("language: de"));
    await expect(localStorage.getItem("language")).toBe("de");

    // Put it back so the next story does not inherit German.
    await userEvent.click(canvas.getByRole("button", { name: "EN" }));
    await waitFor(() => expect(canvas.getByTestId("language")).toHaveTextContent("language: en"));
  },
};

export const OnLight: Story = {
  render: () => (
    <div className="rounded-md border p-4">
      <LanguageSwitch />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The same component without its dark ground. The inactive option is `text-oe-white/70`, " +
          "so it all but disappears — worth knowing before dropping this into a light surface.",
      },
    },
  },
};
