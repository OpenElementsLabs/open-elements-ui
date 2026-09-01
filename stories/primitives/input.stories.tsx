import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Input, Label } from "../../src/index.ts";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  args: { placeholder: "anna.weber@example.com" },
  argTypes: {
    type: { control: "select", options: ["text", "email", "password", "number", "search", "file"] },
    disabled: { control: "boolean" },
    "aria-invalid": { control: "boolean", name: "aria-invalid" },
  },
  render: (args) => <Input {...args} className="max-w-sm" />,
  parameters: {
    docs: {
      description: {
        component:
          "A single-line field. The error styling is driven entirely by `aria-invalid`, so the " +
          "accessible state and the visual state cannot drift apart.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole("textbox");
    await userEvent.type(input, "hello@example.com");
    await expect(input).toHaveValue("hello@example.com");
  },
};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="email">Email address</Label>
      <Input {...args} id="email" type="email" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    // The label is wired to the field, so the field is reachable by its name.
    await expect(within(canvasElement).getByLabelText("Email address")).toBeVisible();
  },
};

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "not-an-email" },
  render: (args) => (
    <div className="grid max-w-sm gap-2">
      <Label htmlFor="email-invalid">Email address</Label>
      <Input {...args} id="email-invalid" aria-describedby="email-error" />
      <p id="email-error" className="text-destructive text-sm">
        Enter a valid email address.
      </p>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only for now" },
};

export const Types: Story = {
  render: (args) => (
    <div className="grid max-w-sm gap-4">
      {(["text", "email", "password", "number", "search"] as const).map((type) => (
        <div key={type} className="grid gap-2">
          <Label htmlFor={`input-${type}`}>{type}</Label>
          <Input {...args} id={`input-${type}`} type={type} placeholder={type} />
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { exclude: ["type", "placeholder"] } },
};
