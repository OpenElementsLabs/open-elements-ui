import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, within } from "storybook/test";
import { TranslateButton } from "../../src/index.ts";
import type { TranslateResult } from "../../src/index.ts";
import { TRANSLATE_BUTTON_TRANSLATIONS, delay } from "../support/fixtures.ts";
import { expectVisible } from "../support/overlay.ts";

const GERMAN_TEXT =
  "Die Rechnung ist seit vierzehn Tagen überfällig; eine Erinnerung wurde bereits versendet.";

async function onTranslate(_text: string, targetLanguage: string): Promise<TranslateResult> {
  await delay(600);
  return {
    translatedText: `[${targetLanguage}] The invoice has been overdue for fourteen days; a reminder has already been sent.`,
  };
}

const meta: Meta<typeof TranslateButton> = {
  title: "Actions/TranslateButton",
  component: TranslateButton,
  args: {
    text: GERMAN_TEXT,
    configured: true,
    size: "md",
    onTranslate,
    translations: TRANSLATE_BUTTON_TRANSLATIONS,
  },
  argTypes: {
    text: { control: "text", description: "Empty or whitespace hides the button entirely." },
    configured: {
      control: "select",
      options: [true, false, null],
      description:
        "Whether the backend feature is switched on. `null` means the probe is still in flight — " +
        "the button stays hidden so it cannot flash in and out.",
    },
    size: { control: "inline-radio", options: ["sm", "md"] },
    onTranslate: { table: { disable: true } },
    translations: { table: { disable: true } },
  },
  render: (args) => (
    <p className="flex max-w-md items-start text-sm">
      {args.text}
      <TranslateButton {...args} />
    </p>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "A translate affordance that sits beside a piece of text and opens a `TranslateDialog`. " +
          "It renders nothing at all in three cases: no text, a probe still in flight, or the " +
          "feature not configured.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByTestId("translate-button");
    await expect(button).toHaveAccessibleName(TRANSLATE_BUTTON_TRANSLATIONS.button);

    await userEvent.click(button);
    const dialog = await screen.findByRole("dialog");
    await expectVisible(within(dialog).getByTestId("translate-dialog-loading"));
    await expect(
      await within(dialog).findByTestId("translate-dialog-result", undefined, { timeout: 5000 }),
    ).toHaveTextContent("The invoice has been overdue");
  },
};

export const Small: Story = {
  args: { size: "sm" },
};

export const NotConfigured: Story = {
  args: { configured: false },
  parameters: {
    docs: {
      description: { story: "The backend has no translation provider, so nothing renders." },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId("translate-button")).toBeNull();
  },
};

export const ProbeInFlight: Story = {
  args: { configured: null },
  parameters: {
    docs: {
      description: {
        story:
          "`configured === null` is the app saying it does not know yet. Hiding rather than " +
          "guessing is what stops the button appearing and then vanishing.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId("translate-button")).toBeNull();
  },
};

export const NoText: Story = {
  args: { text: "   " },
  parameters: {
    docs: { description: { story: "Whitespace counts as nothing to translate." } },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByTestId("translate-button")).toBeNull();
  },
};
