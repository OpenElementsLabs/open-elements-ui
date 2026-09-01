import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Button, DeleteConfirmDialog } from "../../src/index.ts";
import { delay } from "../support/fixtures.ts";
import { expectVisible } from "../support/overlay.ts";

interface DeleteStoryProps {
  readonly latencyMs: number;
  readonly failsWith: string | null;
}

/**
 * The dialog is prop-driven — it owns nothing but its own loading flag — so a
 * story has to hold `open` and hand it a confirm handler.
 */
function DeleteConfirmHarness({ latencyMs, failsWith }: DeleteStoryProps) {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  return (
    <div className="flex flex-col items-start gap-4">
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete company
      </Button>
      {deleted && (
        <p data-testid="outcome" className="text-primary text-sm">
          Deleted.
        </p>
      )}
      <DeleteConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Open Elements GmbH?"
        description="Its contacts stay, but the link to them is lost. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        errorTitle="Could not delete"
        error={failsWith}
        onConfirm={async () => {
          await delay(latencyMs);
          setDeleted(true);
          setOpen(false);
        }}
      />
    </div>
  );
}

const meta: Meta<DeleteStoryProps> = {
  title: "Overlays/DeleteConfirmDialog",
  render: (args) => <DeleteConfirmHarness {...args} />,
  args: { latencyMs: 800, failsWith: null },
  argTypes: {
    latencyMs: {
      control: { type: "range", min: 0, max: 4000, step: 100 },
      description: "How long the delete appears to take.",
    },
    failsWith: {
      control: "text",
      description:
        "Set a message to put the dialog into its error shape: the description is replaced, the " +
        "title falls back to `errorTitle`, and only a dismiss button remains.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A confirmation for destructive actions, built on `AlertDialog`. It spins while " +
          "`onConfirm` is in flight and refuses a second click until that promise settles.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<DeleteStoryProps>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Delete company" }));

    const dialog = await screen.findByRole("alertdialog");
    await expectVisible(within(dialog).getByText("Delete Open Elements GmbH?"));

    await userEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    // Disabled for the whole in-flight window, so a double click cannot delete twice.
    await waitFor(() =>
      expect(within(dialog).getByRole("button", { name: "Delete" })).toBeDisabled(),
    );

    await waitFor(() => expect(canvas.getByTestId("outcome")).toBeVisible(), { timeout: 4000 });
  },
};

export const Cancelled: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Delete company" }));

    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));

    await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    await expect(canvas.queryByTestId("outcome")).toBeNull();
  },
};

export const Failed: Story = {
  args: { failsWith: "The company is referenced by three open invoices." },
  parameters: {
    docs: {
      description: {
        story:
          "With an `error` set the dialog stops offering the destructive action at all — there is " +
          "one button left, and it only dismisses.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Delete company" }));

    const dialog = await screen.findByRole("alertdialog");
    await expectVisible(within(dialog).getByText("Could not delete"));
    await expectVisible(
      within(dialog).getByText("The company is referenced by three open invoices."),
    );
    await expect(within(dialog).getAllByRole("button")).toHaveLength(1);
  },
};
