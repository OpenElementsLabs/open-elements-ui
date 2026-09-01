import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn } from "storybook/test";
import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../src/index.ts";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  parameters: {
    docs: {
      description: {
        component:
          "A surface with a header/content/footer rhythm. `CardHeader` is a grid that only opens a " +
          "second column when a `CardAction` is present, so a card without an action needs no " +
          "different markup.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader>
        <CardTitle>Open Elements GmbH</CardTitle>
        <CardDescription>Customer since March 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Three open opportunities and one support ticket awaiting a first response.
        </p>
      </CardContent>
    </Card>
  ),
};

export const WithAction: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader>
        <CardTitle>Open Elements GmbH</CardTitle>
        <CardDescription>Customer since March 2024</CardDescription>
        <CardAction>
          <Badge variant="secondary">Key account</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p className="text-sm">The action sits in a second column the header grows on demand.</p>
      </CardContent>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const header = canvasElement.querySelector<HTMLElement>('[data-slot="card-header"]');
    await expect(header).not.toBeNull();
    // Two columns only because a CardAction is present.
    await expect(getComputedStyle(header!).gridTemplateColumns.split(" ")).toHaveLength(2);
  },
};

export const WithFooter: Story = {
  render: (args) => (
    <Card {...args} className="max-w-sm">
      <CardHeader className="border-b">
        <CardTitle>Delete this company?</CardTitle>
        <CardDescription>Its contacts stay, but the link to them is lost.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">This cannot be undone.</p>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t">
        <Button variant="outline" onClick={fn()}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={fn()}>
          Delete
        </Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Adding `border-b` to the header or `border-t` to the footer also adds the padding that " +
          "goes with a divider — the recipe keys the spacing off the border class itself.",
      },
    },
  },
};

export const Grid: Story = {
  render: (args) => (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {["Open Elements GmbH", "Nordwind AG", "Baltic Systems"].map((name) => (
        <Card {...args} key={name}>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Customer</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">Last contact 12 days ago</p>
          </CardContent>
        </Card>
      ))}
    </div>
  ),
};
