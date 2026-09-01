import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  expect,
  screen,
  userEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from "storybook/test";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "../../src/index.ts";
import { expectVisible } from "../support/overlay.ts";

const meta: Meta<typeof Dialog> = {
  title: "Overlays/Dialog",
  component: Dialog,
  parameters: {
    docs: {
      description: {
        component:
          "A modal dialog. The content is portalled to `document.body`, so a play function has to " +
          "query the whole screen rather than the story canvas.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit contact</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit contact</DialogTitle>
          <DialogDescription>Changes are saved when you confirm.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="dialog-name">Name</Label>
          <Input id="dialog-name" defaultValue="Anna Weber" />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>Save</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit contact" }));

    const dialog = await screen.findByRole("dialog");
    await expectVisible(within(dialog).getByText("Edit contact"));

    // The title and description are wired to the dialog, so it announces itself.
    await expect(dialog).toHaveAttribute("aria-labelledby");
    await expect(dialog).toHaveAttribute("aria-describedby");

    await userEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  },
};

export const ClosesOnEscape: Story = {
  render: Default.render,
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit contact" }));
    await screen.findByRole("dialog");
    await userEvent.keyboard("{Escape}");
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  },
};

export const WithoutCloseButton: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>No corner cross</DialogTitle>
          <DialogDescription>
            Use this when the only way out should be an explicit choice in the footer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open" }));
    const dialog = await screen.findByRole("dialog");
    // The corner cross is gone; the footer's own Close button is not.
    await expect(within(dialog).getAllByRole("button", { name: "Close" })).toHaveLength(1);
    // Worth knowing: `DialogFooter`'s built-in close renders the Radix primitive
    // directly, so unlike the exported `DialogClose` it carries no
    // `data-slot="dialog-close"` for a consuming app to hook styling onto.
    await expect(dialog.querySelectorAll('[data-slot="dialog-close"]')).toHaveLength(0);
  },
};

export const Controlled: Story = {
  args: { open: true },
  argTypes: { open: { control: "boolean" } },
  render: (args) => (
    <Dialog {...args}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Controlled from the Controls panel</DialogTitle>
          <DialogDescription>Toggle the `open` arg to show and hide this dialog.</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
  play: async () => {
    await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
  },
};
