import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { TagChips } from "../../src/index.ts";
import { TAGS } from "../support/fixtures.ts";

const meta: Meta<typeof TagChips> = {
  title: "Data/TagChips",
  component: TagChips,
  args: { tags: TAGS, label: "Tags" },
  argTypes: {
    label: { control: "text", description: "Optional heading. Omit it for a bare row of chips." },
    tags: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A read-only row of tag chips. Each chip is painted with the tag's own colour and picks " +
          "a readable foreground from its luminance; a malformed colour falls back to grey.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const tag of TAGS) {
      await expect(canvas.getByText(tag.name)).toBeVisible();
    }
  },
};

export const ContrastAcrossColours: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // A light chip flips to dark text instead of staying white on yellow.
    await expect(canvas.getByText("Newsletter")).toHaveStyle({ color: "#1A1A1A" });
    // A dark chip keeps white text.
    await expect(canvas.getByText("Churn risk")).toHaveStyle({ color: "#FFFFFF" });
    // An invalid hex falls back to a grey chip rather than rendering unstyled.
    await expect(canvas.getByText("Unclassified")).toHaveStyle({ backgroundColor: "#6B7280" });
  },
};

export const WithoutLabel: Story = {
  args: { label: undefined },
};

export const Empty: Story = {
  args: { tags: [] },
  parameters: {
    docs: {
      description: {
        story: "With no tags the component renders nothing at all — not even its label or spacing.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector("span")).toBeNull();
  },
};
