import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import { Card, CardContent, CardHeader, Skeleton } from "../../src/index.ts";

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  parameters: {
    docs: {
      description: {
        component:
          "A pulsing placeholder. It carries no size of its own — the shape of what is loading is " +
          "expressed with utility classes at the call site.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Skeleton {...args} className="h-4 w-48" />,
  play: async ({ canvasElement }) => {
    const skeleton = canvasElement.querySelector<HTMLElement>('[data-slot="skeleton"]');
    await expect(skeleton).not.toBeNull();
    // `animate-pulse` is a Tailwind core utility, so it must have resolved.
    await expect(getComputedStyle(skeleton!).animationName).not.toBe("none");
  },
};

export const TextBlock: Story = {
  render: (args) => (
    <div className="max-w-sm space-y-2">
      <Skeleton {...args} className="h-4 w-3/4" />
      <Skeleton {...args} className="h-4 w-full" />
      <Skeleton {...args} className="h-4 w-5/6" />
    </div>
  ),
};

export const LoadingCard: Story = {
  render: (args) => (
    <Card className="max-w-sm">
      <CardHeader>
        <Skeleton {...args} className="h-5 w-40" />
        <Skeleton {...args} className="h-4 w-56" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton {...args} className="h-4 w-full" />
        <Skeleton {...args} className="h-4 w-4/5" />
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "The placeholder mirrors the real card's layout, so nothing jumps when data lands.",
      },
    },
  },
};

export const Avatar: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Skeleton {...args} className="size-8 rounded-full" />
      <div className="space-y-2">
        <Skeleton {...args} className="h-3.5 w-32" />
        <Skeleton {...args} className="h-3 w-44" />
      </div>
    </div>
  ),
};
