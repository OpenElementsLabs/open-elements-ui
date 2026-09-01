import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TablePagination,
  TableRow,
} from "../../src/index.ts";
import { PAGINATION_TRANSLATIONS } from "../support/fixtures.ts";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface PaginationStoryProps {
  readonly totalElements: number;
}

function PaginationHarness({ totalElements }: PaginationStoryProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  const rows = Array.from(
    { length: Math.min(pageSize, totalElements - page * pageSize) },
    (_, i) => ({
      index: page * pageSize + i + 1,
    }),
  );

  return (
    <div className="max-w-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>#</TableHead>
            <TableHead>Company</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.index}>
              <TableCell className="font-medium">{row.index}</TableCell>
              <TableCell>Company {row.index}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        page={page}
        pageSize={pageSize}
        totalElements={totalElements}
        totalPages={totalPages}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        storageKey="showcase.pageSize"
        translations={PAGINATION_TRANSLATIONS}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
      <p className="text-muted-foreground mt-2 text-sm" data-testid="state">
        page {page} · size {pageSize}
      </p>
    </div>
  );
}

const meta: Meta<PaginationStoryProps> = {
  title: "Data/TablePagination",
  render: (args) => <PaginationHarness {...args} />,
  args: { totalElements: 42 },
  argTypes: {
    totalElements: {
      control: { type: "number", min: 0, max: 500 },
      description:
        "Drives the total label and, with the page size, how many pages there are. The previous/" +
        "next controls hide entirely when there is only one page.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Page-size select plus previous/next, sitting under a table. It persists the chosen page " +
          "size to `localStorage` under `storageKey`, and resets to the first page when the size " +
          "changes.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<PaginationStoryProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("· 42 entries")).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: PAGINATION_TRANSLATIONS.next }));
    await waitFor(() => expect(canvas.getByTestId("state")).toHaveTextContent("page 1"));

    // First page reached again, so Previous goes dead.
    await userEvent.click(canvas.getByRole("button", { name: PAGINATION_TRANSLATIONS.previous }));
    await waitFor(() =>
      expect(canvas.getByRole("button", { name: PAGINATION_TRANSLATIONS.previous })).toBeDisabled(),
    );
  },
};

export const ChangingPageSizeResetsToFirstPage: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: PAGINATION_TRANSLATIONS.next }));
    await waitFor(() => expect(canvas.getByTestId("state")).toHaveTextContent("page 1"));

    await userEvent.click(canvas.getByRole("combobox", { name: PAGINATION_TRANSLATIONS.perPage }));
    await userEvent.click(await screen.findByRole("option", { name: "25" }));

    await waitFor(() => expect(canvas.getByTestId("state")).toHaveTextContent("page 0 · size 25"));
    // And the choice is remembered for the next visit.
    await expect(localStorage.getItem("showcase.pageSize")).toBe("25");
  },
};

export const SinglePage: Story = {
  args: { totalElements: 7 },
  parameters: {
    docs: {
      description: {
        story: "Fewer entries than one page: the previous/next pair is not rendered at all.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole("button", { name: PAGINATION_TRANSLATIONS.next })).toBeNull();
    await expect(canvas.getByText("· 7 entries")).toBeVisible();
  },
};

export const SingleEntry: Story = {
  args: { totalElements: 1 },
  parameters: {
    docs: {
      description: {
        story: "The singular label is a separate translation key rather than a formatting rule.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("· 1 entry")).toBeVisible();
  },
};
