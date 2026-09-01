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
  Input,
  Label,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../src/index.ts";
import { expectVisible } from "../support/overlay.ts";

const SIDES = ["right", "left", "top", "bottom"] as const;

const meta: Meta<typeof Sheet> = {
  title: "Overlays/Sheet",
  component: Sheet,
  parameters: {
    docs: {
      description: {
        component:
          "A panel that slides in from an edge. Which edge is a prop on `SheetContent`, not on the " +
          "root, because the root has no DOM of its own.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit profile</SheetTitle>
          <SheetDescription>Changes apply immediately.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-2 px-4">
          <Label htmlFor="sheet-name">Display name</Label>
          <Input id="sheet-name" defaultValue="Anna Weber" />
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button>Done</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Edit profile" }));
    const sheet = await screen.findByRole("dialog");
    await expectVisible(within(sheet).getByText("Edit profile"));
    await userEvent.click(within(sheet).getByRole("button", { name: "Done" }));
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  },
};

export const Sides: Story = {
  render: (args) => (
    <div className="flex flex-wrap gap-3">
      {SIDES.map((side) => (
        <Sheet {...args} key={side}>
          <SheetTrigger asChild>
            <Button variant="outline">From {side}</Button>
          </SheetTrigger>
          <SheetContent side={side}>
            <SheetHeader>
              <SheetTitle>side=&quot;{side}&quot;</SheetTitle>
              <SheetDescription>
                Left and right take three quarters of the width; top and bottom size to their
                content.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // A left sheet is anchored to the left edge, which is what `side` actually controls.
    await userEvent.click(within(canvasElement).getByRole("button", { name: "From left" }));
    const sheet = await screen.findByRole("dialog");
    // It slides in from off-screen, so wait for it to land rather than catching
    // it mid-transition.
    await waitFor(() => expect(sheet.getBoundingClientRect().left).toBe(0));
  },
};

export const WithoutCloseButton: Story = {
  render: (args) => (
    <Sheet {...args}>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>No corner cross</SheetTitle>
          <SheetDescription>Escape and the overlay still dismiss it.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Open" }));
    const sheet = await screen.findByRole("dialog");
    await expect(within(sheet).queryByRole("button", { name: "Close" })).toBeNull();
    await userEvent.keyboard("{Escape}");
    await waitForElementToBeRemoved(() => screen.queryByRole("dialog"));
  },
};
