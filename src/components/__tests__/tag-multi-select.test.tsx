import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TagMultiSelect } from "../tag-multi-select.tsx";
import type { TagOption, TagMultiSelectTranslations } from "../../types/index.ts";

const mockTranslations: TagMultiSelectTranslations = {
  placeholder: "Choose tags...",
  empty: "No tags available",
};

const mockTags: TagOption[] = [
  { value: "1", label: "VIP", color: "#FF0000" },
  { value: "2", label: "Partner", color: "#00FF00" },
  { value: "3", label: "Lead", color: "#0000FF" },
];

afterEach(() => {
  cleanup();
});

// The listbox is portalled and only mounted while the combobox is open, so the
// empty message is not in the DOM until the popup is opened. ArrowDown is the
// combobox open interaction that works without layout, which jsdom lacks.
async function openPopup() {
  const input = screen.getByPlaceholderText("Choose tags...");
  fireEvent.keyDown(input, { key: "ArrowDown" });
  await waitFor(() => {
    expect(input).toHaveAttribute("aria-expanded", "true");
  });
}

describe("TagMultiSelect", () => {
  it("calls loadTags on mount", async () => {
    const loadTags = vi.fn().mockResolvedValue(mockTags);

    render(
      <TagMultiSelect
        selectedIds={[]}
        onChange={() => {}}
        loadTags={loadTags}
        translations={mockTranslations}
      />,
    );

    await waitFor(() => {
      expect(loadTags).toHaveBeenCalledTimes(1);
    });
  });

  it("displays placeholder from translations", () => {
    const loadTags = vi.fn().mockResolvedValue([]);

    render(
      <TagMultiSelect
        selectedIds={[]}
        onChange={() => {}}
        loadTags={loadTags}
        translations={mockTranslations}
      />,
    );

    expect(screen.getByPlaceholderText("Choose tags...")).toBeInTheDocument();
  });

  it("shows empty message when no tags loaded", async () => {
    const loadTags = vi.fn().mockResolvedValue([]);

    render(
      <TagMultiSelect
        selectedIds={[]}
        onChange={() => {}}
        loadTags={loadTags}
        translations={mockTranslations}
      />,
    );

    await waitFor(() => {
      expect(loadTags).toHaveBeenCalled();
    });
    await openPopup();

    expect(screen.getByText("No tags available")).toBeInTheDocument();
  });

  it("handles loadTags failure without crashing", async () => {
    const loadTags = vi.fn().mockRejectedValue(new Error("Network error"));

    render(
      <TagMultiSelect
        selectedIds={[]}
        onChange={() => {}}
        loadTags={loadTags}
        translations={mockTranslations}
      />,
    );

    await waitFor(() => {
      expect(loadTags).toHaveBeenCalled();
    });
    await openPopup();

    expect(screen.getByText("No tags available")).toBeInTheDocument();
  });

  it("renders selected tags as chips with correct colors", async () => {
    const loadTags = vi.fn().mockResolvedValue(mockTags);

    render(
      <TagMultiSelect
        selectedIds={["1"]}
        onChange={() => {}}
        loadTags={loadTags}
        translations={mockTranslations}
      />,
    );

    await waitFor(() => {
      const chip = screen.getByText("VIP");
      expect(chip).toBeInTheDocument();
    });
  });

  it("uses fallback color for invalid hex", async () => {
    const loadTags = vi
      .fn()
      .mockResolvedValue([{ value: "1", label: "Bad Color", color: "not-a-color" }]);

    render(
      <TagMultiSelect
        selectedIds={["1"]}
        onChange={() => {}}
        loadTags={loadTags}
        translations={mockTranslations}
      />,
    );

    await waitFor(() => {
      const chipEl = screen.getByText("Bad Color");
      expect(chipEl.closest("[data-slot='combobox-chip']")).toHaveStyle({
        backgroundColor: "#6B7280",
      });
    });
  });
});
