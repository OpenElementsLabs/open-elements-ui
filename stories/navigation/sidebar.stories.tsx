import type { Meta, StoryObj } from "@storybook/react-vite";
import { Building2, Contact, LayoutDashboard, ListTodo, Settings, Tags } from "lucide-react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";
import { CollapsibleGroup, NavItem, Sidebar, SidebarHeader, UserSection } from "../../src/index.ts";
import { USER_SECTION_TRANSLATIONS } from "../support/fixtures.ts";

const USER = {
  userName: "Anna Weber",
  roles: ["Administrator", "Sales"],
  onLogout: fn(),
  onAvatarClick: fn(),
  translations: USER_SECTION_TRANSLATIONS,
};

function Nav() {
  return (
    <>
      <NavItem
        href="#dashboard"
        icon={<LayoutDashboard className="h-4 w-4" />}
        label="Dashboard"
        active
      />
      <NavItem href="#companies" icon={<Building2 className="h-4 w-4" />} label="Companies" />
      <NavItem href="#contacts" icon={<Contact className="h-4 w-4" />} label="Contacts" />
      <CollapsibleGroup icon={<Settings className="h-4 w-4" />} label="Administration">
        <NavItem href="#tags" icon={<Tags className="h-4 w-4" />} label="Tags" indented />
        <NavItem
          href="#tasks"
          icon={<ListTodo className="h-4 w-4" />}
          label="Task types"
          indented
        />
      </CollapsibleGroup>
    </>
  );
}

const meta: Meta<typeof Sidebar> = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  args: { appTitle: "Open CRM", menuLabel: "Menu" },
  argTypes: {
    appTitle: { control: "text" },
    menuLabel: { control: "text", description: "Accessible name of the mobile hamburger." },
    developedByText: { control: "text" },
    header: { table: { disable: true } },
    user: { table: { disable: true } },
    children: { table: { disable: true } },
    bottomChildren: { table: { disable: true } },
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The application shell's navigation. It renders both variants at once and lets CSS " +
          "choose: a fixed rail from the `md` breakpoint up, a hamburger opening a `Sheet` below " +
          "it. Which one you see here depends on the width of the preview — narrow the viewport to " +
          "get the mobile header.\n\n" +
          "Note that the header links to `/oe-logo-landscape-dark.svg`; the consuming app has to " +
          "serve that asset, and in this showcase it is simply missing.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="h-[520px]">
      <Sidebar {...args} user={USER}>
        <Nav />
      </Sidebar>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText("Open CRM").length).toBeGreaterThan(0);
    await expect(canvas.getByRole("link", { name: /Companies/ })).toBeVisible();

    // Both variants are always in the DOM; a media query picks one. At the
    // preview's default width that is the rail, and the mobile header is off.
    const rail = canvasElement.querySelector<HTMLElement>("aside")!;
    const mobileHeader = canvasElement.querySelector<HTMLElement>("header")!;
    await expect(getComputedStyle(rail).display).not.toBe("none");
    await expect(getComputedStyle(mobileHeader).display).toBe("none");
  },
};

export const CollapsibleGroups: Story = {
  render: (args) => (
    <div className="h-[520px]">
      <Sidebar {...args} user={USER}>
        <Nav />
      </Sidebar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A group starts closed and keeps its own open state; the chevron rotates rather than " +
          "swapping icon.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Closed to begin with, so the nested items are not in the DOM at all.
    await expect(canvas.queryByRole("link", { name: /Task types/ })).toBeNull();

    await userEvent.click(canvas.getAllByRole("button", { name: /Administration/ })[0]);
    await waitFor(() =>
      expect(canvas.getAllByRole("link", { name: /Task types/ })[0]).toBeVisible(),
    );
  },
};

export const WithoutUser: Story = {
  render: (args) => (
    <div className="h-[520px]">
      <Sidebar {...args}>
        <Nav />
      </Sidebar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "`user` is optional — the language switch stays, the account block disappears.",
      },
    },
  },
};

export const WithBottomItems: Story = {
  render: (args) => (
    <div className="h-[520px]">
      <Sidebar
        {...args}
        user={USER}
        bottomChildren={
          <NavItem href="#settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
        }
      >
        <Nav />
      </Sidebar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "`bottomChildren` is pushed to the foot of the nav, above the language switch.",
      },
    },
  },
};

export const MobileMenu: Story = {
  globals: { viewport: { value: "mobile1" } },
  render: (args) => (
    <div className="h-[520px]">
      <Sidebar {...args} user={USER}>
        <Nav />
      </Sidebar>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Below `md` the rail is replaced by a header with a hamburger. Opening it mounts the same " +
          "nav inside a left `Sheet`, and every `NavItem` gets an extra handler that closes the " +
          "sheet — which is why the sidebar clones its children rather than rendering them twice.\n\n" +
          "The story sets a phone viewport, but the switch is a CSS media query on the preview " +
          "frame: at a desktop width the hamburger is `display: none` and therefore not in the " +
          "accessibility tree at all. That is also why this story carries no `play` function — " +
          "narrow the preview and open the drawer by hand.",
      },
    },
  },
};

export const HeaderOnly: Story = {
  render: (args) => (
    <div className="bg-oe-dark w-64">
      <SidebarHeader appTitle={args.appTitle} developedByText={args.developedByText} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        story:
          "`SidebarHeader` on its own, for an app that supplies a custom `header`. The " +
          '"developed by" logo is an app-served asset and is missing here.',
      },
    },
  },
};

export const UserSectionOnly: Story = {
  render: () => (
    <div className="bg-oe-dark w-64">
      <UserSection {...USER} />
    </div>
  ),
  parameters: { layout: "padded" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The roles are only reachable through the tooltip on the name.
    await userEvent.hover(canvas.getByText("Anna Weber"));
    await expect(await screen.findByRole("tooltip")).toHaveTextContent("Administrator, Sales");
  },
};

export const UserSectionWithoutRoles: Story = {
  render: () => (
    <div className="bg-oe-dark w-64">
      <UserSection {...USER} roles={[]} />
    </div>
  ),
  parameters: { layout: "padded" },
  play: async ({ canvasElement }) => {
    await userEvent.hover(within(canvasElement).getByText("Anna Weber"));
    await expect(await screen.findByRole("tooltip")).toHaveTextContent(
      USER_SECTION_TRANSLATIONS.noRoles,
    );
  },
};
