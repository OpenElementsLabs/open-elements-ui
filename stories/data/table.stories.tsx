import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import {
  Badge,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../src/index.ts";

const ROWS = [
  { id: "INV-1024", company: "Open Elements GmbH", status: "Paid", amount: "€ 4,200.00" },
  { id: "INV-1025", company: "Nordwind AG", status: "Open", amount: "€ 1,850.00" },
  { id: "INV-1026", company: "Baltic Systems", status: "Overdue", amount: "€ 990.00" },
  { id: "INV-1027", company: "Helios Energie", status: "Paid", amount: "€ 12,400.00" },
];

const STATUS_VARIANT = {
  Paid: "secondary",
  Open: "outline",
  Overdue: "destructive",
} as const;

const meta: Meta<typeof Table> = {
  title: "Data/Table",
  component: Table,
  parameters: {
    docs: {
      description: {
        component:
          "A plain table with brand styling. `Table` wraps itself in an `overflow-x-auto` " +
          "container, so a wide table scrolls inside its column instead of widening the page.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.company}</TableCell>
            <TableCell>
              <Badge variant={STATUS_VARIANT[row.status as keyof typeof STATUS_VARIANT]}>
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  play: async ({ canvasElement }) => {
    const table = within(canvasElement).getByRole("table");
    await expect(within(table).getAllByRole("row")).toHaveLength(ROWS.length + 1);
    await expect(within(table).getAllByRole("columnheader")).toHaveLength(4);
  },
};

export const WithCaptionAndFooter: Story = {
  render: (args) => (
    <Table {...args}>
      <TableCaption>Invoices issued in May 2026.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.company}</TableCell>
            <TableCell className="text-right">{row.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">€ 19,440.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
};

export const SelectedRow: Story = {
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Company</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map((row, index) => (
          <TableRow key={row.id} data-state={index === 1 ? "selected" : undefined}>
            <TableCell className="font-medium">{row.id}</TableCell>
            <TableCell>{row.company}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Selection is expressed with `data-state="selected"` on the row — the component keeps ' +
          "no selection state of its own.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const selected = canvasElement.querySelector<HTMLElement>('tr[data-state="selected"]');
    await expect(selected).not.toBeNull();
    await expect(getComputedStyle(selected!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  },
};

export const Scrolls: Story = {
  render: (args) => (
    <div className="max-w-md">
      <Table {...args}>
        <TableHeader>
          <TableRow>
            {["Invoice", "Company", "Contact", "Issued", "Due", "Status", "Amount"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {ROWS.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.company}</TableCell>
              <TableCell>anna.weber@example.com</TableCell>
              <TableCell>2026-05-04</TableCell>
              <TableCell>2026-06-03</TableCell>
              <TableCell>{row.status}</TableCell>
              <TableCell className="text-right">{row.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Seven columns in a 28rem box. The container scrolls; the page does not — which is the " +
          "reason `Table` renders its own wrapper.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const container = canvasElement.querySelector<HTMLElement>('[data-slot="table-container"]');
    await expect(container!.scrollWidth).toBeGreaterThan(container!.clientWidth);
  },
};
