import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { UserAvatar } from "../../src/index.ts";
import { USERS } from "../support/fixtures.ts";

const meta: Meta<typeof UserAvatar> = {
  title: "Data/UserAvatar",
  component: UserAvatar,
  args: { user: USERS[0], size: "md" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md"] },
    user: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Initials on a colour derived from the user's id, or the photo when there is one. The " +
          "colour is a hash, so the same person is always the same colour without storing one.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("AW")).toBeVisible();
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      {(["sm", "md"] as const).map((size) => (
        <div key={size} className="flex items-center gap-2">
          <UserAvatar {...args} size={size} />
          <span className="text-muted-foreground text-sm">{size}</span>
        </div>
      ))}
    </div>
  ),
  parameters: { controls: { exclude: ["size"] } },
};

export const StableColours: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-3">
      {USERS.map((user) => (
        <div key={user.id} className="flex items-center gap-2">
          <UserAvatar {...args} user={user} />
          <span className="text-sm">{user.name}</span>
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const avatars = Array.from(canvasElement.querySelectorAll("span")).filter((el) =>
      /^[A-Z]{1,2}$/.test(el.textContent ?? ""),
    );
    await expect(avatars).toHaveLength(USERS.length);
    // The palette is fixed, so different people can collide — but a colour is always assigned.
    for (const avatar of avatars) {
      await expect(getComputedStyle(avatar).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    }
  },
};

export const WithPhoto: Story = {
  args: {
    user: {
      ...USERS[2],
      // Inline so the story never depends on the network.
      avatarUrl:
        "data:image/svg+xml;utf8," +
        encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%235CBA9E"/><circle cx="32" cy="25" r="12" fill="white"/><ellipse cx="32" cy="58" rx="20" ry="16" fill="white"/></svg>',
        ),
    },
  },
  play: async ({ canvasElement }) => {
    const img = within(canvasElement).getByRole("img");
    await expect(img).toHaveAccessibleName("Clara Nguyen");
  },
};

export const SingleWordName: Story = {
  args: { user: { id: "u-9", name: "Cher", email: "cher@example.com" } },
  parameters: {
    docs: { description: { story: "One word gives one initial rather than a truncated pair." } },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText("C")).toBeVisible();
  },
};
