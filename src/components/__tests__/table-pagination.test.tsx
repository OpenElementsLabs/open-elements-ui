import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TablePagination, type PaginationTranslations } from "../table-pagination.tsx";

const translations: PaginationTranslations = {
  perPage: "per page",
  previous: "Previous",
  next: "Next",
  totalOne: "{count} entry",
  totalOther: "{count} entries",
};

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  localStorageMock.setItem.mockClear();
});

afterEach(() => {
  cleanup();
});

const defaultProps = {
  page: 0,
  pageSize: 20,
  pageSizeOptions: [10, 20, 50, 100, 200] as const,
  storageKey: "pageSize.test",
  translations,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe("TablePagination", () => {
  it("renders the singular total label when only one entry", () => {
    render(<TablePagination {...defaultProps} totalElements={1} totalPages={1} />);
    expect(screen.getByText(/· 1 entry/)).toBeInTheDocument();
  });

  it("renders the plural total label when more than one entry", () => {
    render(<TablePagination {...defaultProps} totalElements={35} totalPages={2} />);
    expect(screen.getByText(/· 35 entries/)).toBeInTheDocument();
  });

  it("hides previous/next buttons when totalPages <= 1", () => {
    render(<TablePagination {...defaultProps} totalElements={5} totalPages={1} />);
    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.queryByText("Next")).toBeNull();
  });

  it("keeps the page-size selector visible when totalPages <= 1", () => {
    render(<TablePagination {...defaultProps} totalElements={5} totalPages={1} />);
    expect(screen.getByText("per page")).toBeInTheDocument();
  });

  it("disables previous on the first page and enables next", () => {
    render(<TablePagination {...defaultProps} totalElements={35} totalPages={2} />);
    expect(screen.getByText("Previous").closest("button")).toBeDisabled();
    expect(screen.getByText("Next").closest("button")).not.toBeDisabled();
  });

  it("disables next on the last page", () => {
    render(<TablePagination {...defaultProps} page={1} totalElements={35} totalPages={2} />);
    expect(screen.getByText("Next").closest("button")).toBeDisabled();
  });

  it("calls onPageChange with page+1 when next is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        {...defaultProps}
        onPageChange={onPageChange}
        totalElements={35}
        totalPages={2}
      />,
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange with page-1 when previous is clicked", () => {
    const onPageChange = vi.fn();
    render(
      <TablePagination
        {...defaultProps}
        page={1}
        onPageChange={onPageChange}
        totalElements={35}
        totalPages={2}
      />,
    );
    fireEvent.click(screen.getByText("Previous"));
    expect(onPageChange).toHaveBeenCalledWith(0);
  });

  it("sets aria-label on the size selector", () => {
    render(<TablePagination {...defaultProps} totalElements={5} totalPages={1} />);
    expect(screen.getByLabelText("per page")).toBeInTheDocument();
  });

  describe("changing the page size", () => {
    // Radix Select relies on pointer capture and scrollIntoView, which jsdom does not implement.
    beforeEach(() => {
      Element.prototype.hasPointerCapture ??= () => false;
      Element.prototype.releasePointerCapture ??= () => undefined;
      Element.prototype.scrollIntoView ??= () => undefined;
    });

    function selectPageSize(size: string) {
      fireEvent.keyDown(screen.getByLabelText("per page"), { key: "Enter" });
      fireEvent.click(screen.getByRole("option", { name: size }));
    }

    it("stores the new size and resets to the first page", () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      render(
        <TablePagination
          {...defaultProps}
          page={1}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          totalElements={35}
          totalPages={2}
        />,
      );
      selectPageSize("50");
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
      expect(localStorageMock.setItem).toHaveBeenCalledWith("pageSize.test", "50");
      expect(onPageChange).toHaveBeenCalledWith(0);
    });

    it("still changes the size when storage throws", () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new DOMException("The operation is insecure.", "SecurityError");
      });
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();
      render(
        <TablePagination
          {...defaultProps}
          page={1}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          totalElements={35}
          totalPages={2}
        />,
      );
      selectPageSize("50");
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
      expect(onPageChange).toHaveBeenCalledWith(0);
    });
  });
});
