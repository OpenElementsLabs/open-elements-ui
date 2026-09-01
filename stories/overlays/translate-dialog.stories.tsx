import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Button, TranslateDialog } from "../../src/index.ts";
import type { TranslateResult } from "../../src/index.ts";
import { TRANSLATE_DIALOG_TRANSLATIONS, delay } from "../support/fixtures.ts";
import { expectVisible } from "../support/overlay.ts";

const SOURCE_TEXT =
  "Die Rechnung ist seit vierzehn Tagen überfällig; eine Erinnerung wurde bereits versendet.";

interface TranslateStoryProps {
  readonly sourceText: string;
  readonly latencyMs: number;
  readonly fails: boolean;
}

function TranslateHarness({ sourceText, latencyMs, fails }: TranslateStoryProps) {
  const [open, setOpen] = useState(false);

  async function onTranslate(text: string, targetLanguage: string): Promise<TranslateResult> {
    await delay(latencyMs);
    if (fails) throw new Error("Translation backend unavailable");
    return {
      translatedText: `[${targetLanguage}] The invoice has been overdue for fourteen days; a reminder has already been sent.\n\n(source: ${text.slice(0, 24)}…)`,
    };
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <p className="max-w-md text-sm">{sourceText}</p>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Translate
      </Button>
      <TranslateDialog
        open={open}
        onOpenChange={setOpen}
        sourceText={sourceText}
        onTranslate={onTranslate}
        translations={TRANSLATE_DIALOG_TRANSLATIONS}
      />
    </div>
  );
}

const meta: Meta<TranslateStoryProps> = {
  title: "Overlays/TranslateDialog",
  render: (args) => <TranslateHarness {...args} />,
  args: { sourceText: SOURCE_TEXT, latencyMs: 900, fails: false },
  argTypes: {
    sourceText: { control: "text" },
    latencyMs: { control: { type: "range", min: 0, max: 4000, step: 100 } },
    fails: { control: "boolean", description: "Make the translation request reject." },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Fires `onTranslate` every time `open` flips to true, targeting whichever language " +
          "`useLanguage()` reports. The showcase's provider is fixed to English, so the mock is " +
          'called with `"en"`.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<TranslateStoryProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Translate" }));

    const dialog = await screen.findByRole("dialog");
    await expectVisible(within(dialog).getByTestId("translate-dialog-loading"));
    // Nothing to copy while the request is in flight.
    await expect(within(dialog).getByTestId("translate-dialog-copy")).toBeDisabled();

    const result = await within(dialog).findByTestId("translate-dialog-result", undefined, {
      timeout: 5000,
    });
    await expect(result).toHaveTextContent("The invoice has been overdue");
    await expect(within(dialog).getByTestId("translate-dialog-copy")).toBeEnabled();
  },
};

export const Failed: Story = {
  args: { fails: true, latencyMs: 400 },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Translate" }));

    const dialog = await screen.findByRole("dialog");
    const error = await within(dialog).findByTestId("translate-dialog-error", undefined, {
      timeout: 5000,
    });
    await expect(error).toHaveTextContent(TRANSLATE_DIALOG_TRANSLATIONS.error);
    await expect(within(dialog).getByTestId("translate-dialog-copy")).toBeDisabled();
  },
};

export const SlowRequest: Story = {
  args: { latencyMs: 3000 },
  parameters: {
    docs: {
      description: {
        story: "Long enough to sit and look at the loading state.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Translate" }));
    const dialog = await screen.findByRole("dialog");
    await waitFor(() =>
      expect(within(dialog).getByTestId("translate-dialog-loading")).toBeVisible(),
    );
  },
};
