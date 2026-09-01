import type React from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DateRange } from "react-day-picker";
import { expect, userEvent, waitFor, within } from "storybook/test";
import {
  Button,
  Calendar,
  Card,
  CardContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../src/index.ts";

// Fixed so the grid is identical every time the story is opened.
const REFERENCE_MONTH = new Date(2026, 4, 1);

/**
 * `DayPicker`'s props are a union discriminated by `mode`, which collapses to
 * `never` when Storybook tries to derive args from it. The catalogue therefore
 * declares only the presentation props it actually exposes as controls, and
 * each story sets `mode` itself.
 */
interface CalendarArgs {
  readonly captionLayout?: "label" | "dropdown" | "dropdown-months" | "dropdown-years";
  readonly showOutsideDays?: boolean;
  readonly showWeekNumber?: boolean;
  readonly buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}

const meta: Meta<CalendarArgs> = {
  title: "Forms/Calendar",
  argTypes: {
    captionLayout: {
      control: "select",
      options: ["label", "dropdown", "dropdown-months", "dropdown-years"],
    },
    showOutsideDays: { control: "boolean" },
    showWeekNumber: { control: "boolean" },
    buttonVariant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
  },
  args: { showOutsideDays: true, captionLayout: "label", buttonVariant: "ghost" },
  parameters: {
    docs: {
      description: {
        component:
          "`react-day-picker` restyled onto the brand. Every day cell is a `Button`, so the day " +
          "grid inherits the same focus ring as the rest of the library.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<CalendarArgs>;

export const Single: Story = {
  render: function Single(args) {
    const [selected, setSelected] = useState<Date | undefined>(new Date(2026, 4, 14));
    return (
      <div className="flex flex-col items-start gap-3">
        <Calendar
          {...args}
          mode="single"
          selected={selected}
          onSelect={setSelected}
          defaultMonth={REFERENCE_MONTH}
        />
        <p className="text-muted-foreground text-sm" data-testid="selected">
          {selected ? selected.toDateString() : "nothing selected"}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId("selected")).toHaveTextContent("May 14 2026");

    // The accessible name is a full, locale-formatted date; the visible label is
    // the day number.
    const day21 = canvas.getAllByRole("button").find((b) => b.textContent?.trim() === "21");
    await expect(day21).toBeDefined();
    await userEvent.click(day21!);
    await waitFor(() => expect(canvas.getByTestId("selected")).toHaveTextContent("May 21 2026"));
  },
};

export const Range: Story = {
  render: function Range(args) {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(2026, 4, 11),
      to: new Date(2026, 4, 15),
    });
    return (
      <div className="flex flex-col items-start gap-3">
        <Calendar
          {...args}
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={REFERENCE_MONTH}
        />
        <p className="text-muted-foreground text-sm" data-testid="range">
          {range?.from?.toDateString() ?? "—"} → {range?.to?.toDateString() ?? "—"}
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    // The ends of the range are marked so they can be rounded independently.
    await expect(canvasElement.querySelector('[data-range-start="true"]')).not.toBeNull();
    await expect(canvasElement.querySelector('[data-range-end="true"]')).not.toBeNull();
  },
};

export const WithDropdownCaption: Story = {
  args: { captionLayout: "dropdown" },
  render: (args) => (
    <Calendar
      {...args}
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      startMonth={new Date(2020, 0)}
      endMonth={new Date(2030, 11)}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Month and year become selects, which needs a `startMonth`/`endMonth` window.",
      },
    },
  },
};

export const WithDisabledDays: Story = {
  render: (args) => (
    <Calendar
      {...args}
      mode="single"
      defaultMonth={REFERENCE_MONTH}
      disabled={{ dayOfWeek: [0, 6] }}
    />
  ),
  parameters: {
    docs: {
      description: { story: "Weekends refused — `disabled` takes a react-day-picker matcher." },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll("[disabled]").length).toBeGreaterThan(0);
  },
};

export const InAPopover: Story = {
  render: function InAPopover(args) {
    const [selected, setSelected] = useState<Date | undefined>();
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">{selected ? selected.toDateString() : "Pick a date"}</Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            {...args}
            mode="single"
            selected={selected}
            onSelect={setSelected}
            defaultMonth={REFERENCE_MONTH}
          />
        </PopoverContent>
      </Popover>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Inside a popover or a card the calendar drops its own background — it detects the " +
          "surrounding slot rather than taking a prop for it.",
      },
    },
  },
};

export const InACard: Story = {
  render: (args) => (
    <Card className="w-fit">
      <CardContent>
        <Calendar {...args} mode="single" defaultMonth={REFERENCE_MONTH} />
      </CardContent>
    </Card>
  ),
};
