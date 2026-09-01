import type { Preview } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { LanguageProvider, TooltipProvider, de, en } from "../src/index.ts";
import "./preview.css";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    layout: "padded",
  },
  decorators: [
    // Stand in for the consuming app's root. Both providers are genuine
    // preconditions, not showcase scaffolding: `Tooltip` throws outside a
    // `TooltipProvider`, and `LanguageSwitch`, `TranslateDialog` and `Sidebar`
    // all call `useLanguage()`, which throws outside a `LanguageProvider`.
    (Story: () => ReactNode) => (
      <LanguageProvider translations={{ de, en }} defaultLanguage="en">
        <TooltipProvider delayDuration={0}>
          <div className="font-body text-foreground bg-background">
            <Story />
          </div>
        </TooltipProvider>
      </LanguageProvider>
    ),
  ],
};

export default preview;
