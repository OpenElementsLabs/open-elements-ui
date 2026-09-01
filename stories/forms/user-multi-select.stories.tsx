import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { Label, UserMultiSelect } from "../../src/index.ts";
import { USERS, USER_MULTI_SELECT_TRANSLATIONS } from "../support/fixtures.ts";

interface UserStoryProps {
  readonly initialSelectedIds: readonly string[];
  readonly disabledIds: readonly string[];
}

function UserMultiSelectHarness({ initialSelectedIds, disabledIds }: UserStoryProps) {
  const [selectedIds, setSelectedIds] = useState<readonly string[]>(initialSelectedIds);
  return (
    <div className="grid max-w-md gap-2">
      <Label>Assignees</Label>
      <UserMultiSelect
        users={USERS}
        selectedIds={selectedIds}
        onChange={setSelectedIds}
        disabledIds={disabledIds}
        translations={USER_MULTI_SELECT_TRANSLATIONS}
      />
      <p className="text-muted-foreground text-sm" data-testid="selected">
        {selectedIds.length > 0 ? selectedIds.join(", ") : "nobody assigned"}
      </p>
    </div>
  );
}

const meta: Meta<UserStoryProps> = {
  title: "Forms/UserMultiSelect",
  render: (args) => <UserMultiSelectHarness {...args} />,
  args: { initialSelectedIds: [], disabledIds: [] },
  argTypes: {
    initialSelectedIds: { control: "check", options: USERS.map((u) => u.id) },
    disabledIds: {
      control: "check",
      options: USERS.map((u) => u.id),
      description: "People who cannot be added or removed — an owner the app pins, for instance.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A popover picker over a fixed list of people, with search over both name and email. " +
          "Selected people appear as removable chips on the trigger itself.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<UserStoryProps>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(USER_MULTI_SELECT_TRANSLATIONS.placeholder),
    ).toBeVisible();
  },
};

export const SelectAndRemove: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("combobox"));

    await userEvent.click(await screen.findByRole("button", { name: /Ben Okafor/ }));
    await waitFor(() => expect(canvas.getByTestId("selected")).toHaveTextContent("u-2"));

    // Close the popover so the chip on the trigger is the only match left.
    await userEvent.keyboard("{Escape}");

    const chip = canvas.getByText("Ben Okafor").closest("span");
    await userEvent.click(within(chip!.parentElement!).getByRole("button"));
    await waitFor(() =>
      expect(canvas.getByTestId("selected")).toHaveTextContent("nobody assigned"),
    );
  },
};

export const Search: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("combobox"));

    const search = await screen.findByPlaceholderText(
      USER_MULTI_SELECT_TRANSLATIONS.searchPlaceholder,
    );
    // Matching is on the email as well as the name.
    await userEvent.type(search, "clara.nguyen@");
    await waitFor(async () =>
      expect(await screen.findAllByRole("button", { name: /Nguyen/ })).toHaveLength(1),
    );

    await userEvent.clear(search);
    await userEvent.type(search, "nobody");
    await expect(await screen.findByText(USER_MULTI_SELECT_TRANSLATIONS.empty)).toBeVisible();
  },
};

export const WithPinnedAssignee: Story = {
  args: { initialSelectedIds: ["u-1"], disabledIds: ["u-1"] },
  parameters: {
    docs: {
      description: {
        story:
          "A disabled id keeps its chip but loses the remove control, and its row in the list " +
          "cannot be toggled.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByText("Anna Weber").closest("span");
    // No remove affordance on a pinned chip.
    await expect(within(chip!.parentElement!).queryByRole("button")).toBeNull();

    await userEvent.click(canvas.getByRole("combobox"));
    await expect(await screen.findByRole("button", { name: /Anna Weber/ })).toBeDisabled();
  },
};
