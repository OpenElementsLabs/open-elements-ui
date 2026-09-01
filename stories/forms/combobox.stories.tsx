import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Label,
  useComboboxAnchor,
} from "../../src/index.ts";

const STAGES = ["Lead", "Qualified", "Proposal sent", "Negotiation", "Won", "Lost"];

const meta: Meta<typeof Combobox> = {
  title: "Forms/Combobox",
  component: Combobox,
  parameters: {
    docs: {
      description: {
        component:
          "A searchable picker built on Base UI. Two shapes are in use in this library: a plain " +
          "input with a dropdown, and the chips variant that `TagMultiSelect` builds on.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: function Single() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div className="grid max-w-sm gap-2">
        <Label>Deal stage</Label>
        <Combobox items={STAGES} value={value} onValueChange={setValue}>
          <ComboboxInput placeholder="Search stages…" />
          <ComboboxContent>
            <ComboboxEmpty>No stage matches.</ComboboxEmpty>
            <ComboboxList>
              {(stage: string) => (
                <ComboboxItem key={stage} value={stage}>
                  {stage}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="text-muted-foreground text-sm" data-testid="selected">
          value: {value ?? "—"}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Both the field and its trigger expose role="combobox", so address the
    // field by its placeholder.
    const input = canvas.getByPlaceholderText("Search stages…");

    await userEvent.click(input);
    await userEvent.type(input, "Prop");

    const option = await screen.findByRole("option", { name: "Proposal sent" });
    await userEvent.click(option);

    await waitFor(() => expect(canvas.getByTestId("selected")).toHaveTextContent("Proposal sent"));
  },
};

export const Chips: Story = {
  render: function Chips() {
    const [value, setValue] = useState<string[]>(["Qualified"]);
    const anchorRef = useComboboxAnchor();
    return (
      <div className="grid max-w-sm gap-2">
        <Label>Stages of interest</Label>
        <Combobox multiple items={STAGES} value={value} onValueChange={setValue}>
          <ComboboxChips ref={anchorRef}>
            {value.map((stage) => (
              <ComboboxChip key={stage}>{stage}</ComboboxChip>
            ))}
            <ComboboxChipsInput placeholder="Add a stage…" />
          </ComboboxChips>
          <ComboboxContent anchor={anchorRef}>
            <ComboboxEmpty>No stage matches.</ComboboxEmpty>
            <ComboboxList>
              {(stage: string) => (
                <ComboboxItem key={stage} value={stage}>
                  {stage}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <p className="text-muted-foreground text-sm" data-testid="selected">
          {value.join(", ") || "—"}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "The chips variant anchors the popup to the chip container rather than the input, so the " +
          "dropdown stays put as chips wrap onto a second line. `useComboboxAnchor()` is the ref " +
          "for that.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("selected")).toHaveTextContent("Qualified");

    await userEvent.click(canvas.getByPlaceholderText("Add a stage…"));
    await userEvent.click(await screen.findByRole("option", { name: "Won" }));

    await waitFor(() => expect(canvas.getByTestId("selected")).toHaveTextContent("Qualified, Won"));
  },
};

export const NoMatches: Story = {
  render: Single.render,
  parameters: {
    docs: {
      description: {
        story:
          "`ComboboxEmpty` only shows itself when the list has nothing left, driven by " +
          "`group-data-empty` on the popup.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByPlaceholderText("Search stages…");
    await userEvent.click(input);
    await userEvent.type(input, "zzzz");
    await expect(await screen.findByText("No stage matches.")).toBeVisible();
  },
};
