import type { TagDto, TagOption, UserOption } from "../../src/index.ts";

/**
 * Sample data shared across stories. Kept in one place so a component that
 * shows a user, a tag or a colour looks the same everywhere in the catalogue.
 */

export const USERS: readonly UserOption[] = [
  { id: "u-1", name: "Anna Weber", email: "anna.weber@example.com" },
  { id: "u-2", name: "Ben Okafor", email: "ben.okafor@example.com" },
  { id: "u-3", name: "Clara Nguyen", email: "clara.nguyen@example.com" },
  { id: "u-4", name: "Diego Ramírez", email: "diego.ramirez@example.com" },
  { id: "u-5", name: "Eva Lindqvist", email: "eva.lindqvist@example.com" },
];

function tag(id: string, name: string, color: string, description: string | null = null): TagDto {
  return {
    id,
    name,
    description,
    color,
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-02-03T14:30:00Z",
    companyCount: 4,
    contactCount: 11,
    taskCount: 2,
  };
}

export const TAGS: readonly TagDto[] = [
  tag("t-1", "Key account", "#5CBA9E", "Long-standing customer"),
  tag("t-2", "Prospect", "#5DB9F5"),
  tag("t-3", "Churn risk", "#E63277", "Needs attention this quarter"),
  // Deliberately light, to exercise the automatic contrast colour.
  tag("t-4", "Newsletter", "#F1E34B"),
  // Deliberately malformed, to exercise the invalid-colour fallback.
  tag("t-5", "Unclassified", "not-a-hex"),
];

export const TAG_OPTIONS: readonly TagOption[] = TAGS.map((t) => ({
  value: t.id,
  label: t.name,
  color: t.color,
}));

export const TAG_MULTI_SELECT_TRANSLATIONS = {
  placeholder: "Tags…",
  empty: "No tags yet. Create your first tag to organize companies and contacts.",
} as const;

export const USER_MULTI_SELECT_TRANSLATIONS = {
  placeholder: "Assign people…",
  searchPlaceholder: "Search by name or email",
  empty: "Nobody matches that search.",
} as const;

export const TAG_FORM_TRANSLATIONS = {
  title: "New tag",
  name: "Name",
  nameRequired: "A name is required.",
  namePlaceholder: "e.g. Key account",
  nameConflict: "A tag with this name already exists.",
  description: "Description",
  descriptionPlaceholder: "What is this tag for?",
  color: "Colour",
  colorRequired: "A colour is required.",
  colorInvalid: "Use a six-digit hex colour, e.g. #5CBA9E.",
  colorPlaceholder: "#5CBA9E",
  save: "Save",
  cancel: "Cancel",
} as const;

export const HEALTH_STATUS_TRANSLATIONS = {
  title: "Backend health",
  statusUp: "All systems operational",
  statusDown: "Backend unreachable",
} as const;

export const DETAIL_FIELD_TRANSLATIONS = {
  copy: "Copy",
  copied: "Copied",
  open: "Open",
  email: "Email",
  call: "Call",
} as const;

export const PAGINATION_TRANSLATIONS = {
  perPage: "per page",
  previous: "Previous",
  next: "Next",
  totalOne: "{count} entry",
  totalOther: "{count} entries",
} as const;

export const TRANSLATE_DIALOG_TRANSLATIONS = {
  title: "Translation",
  loading: "Translating…",
  error: "The translation could not be loaded.",
  copy: "Copy",
  copied: "Copied",
  close: "Close",
} as const;

export const TRANSLATE_BUTTON_TRANSLATIONS = {
  button: "Translate",
  dialog: TRANSLATE_DIALOG_TRANSLATIONS,
} as const;

export const USER_SECTION_TRANSLATIONS = {
  uploadAvatar: "Change profile picture",
  logout: "Sign out",
  noRoles: "No roles assigned",
} as const;

/** Resolves after `ms`, so a story can show a pending state worth looking at. */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
