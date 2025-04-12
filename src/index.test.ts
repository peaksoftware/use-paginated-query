import { renderHook } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useQueries,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { jest, describe, expect, it, beforeEach } from "@jest/globals";
import { usePaginatedQuery, usePagingControls, usePage } from ".";

// Mock dependencies
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueries: jest.fn(),
  useQuery: jest.fn(),
}));

type MockQuery = (
  page: number
) => UseQueryOptions<unknown, unknown, unknown, readonly unknown[]>;

type MockPrefetchQuery = (
  page: number
) => UseQueryOptions<unknown, unknown, unknown, readonly unknown[]>[];

describe("Pagination Hooks", () => {
  const mockRouter = { push: jest.fn() };
  let mockSearchParams: URLSearchParams;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue({
      get: (key: string) => mockSearchParams.get(key),
      toString: () => mockSearchParams.toString(),
    });
  });

  describe("usePage", () => {
    it("returns page 1 when no search param is provided", () => {
      mockSearchParams.delete("page");
      const { result } = renderHook(() => usePage());
      expect(result.current).toBe(1);
    });

    it("returns page number from valid search param", () => {
      mockSearchParams.set("page", "3");
      const { result } = renderHook(() => usePage());
      expect(result.current).toBe(3);
    });

    it("returns 1 for invalid page numbers", () => {
      mockSearchParams.set("page", "invalid");
      const { result } = renderHook(() => usePage());
      expect(result.current).toBe(1);

      mockSearchParams.set("page", "0");
      const { result: result2 } = renderHook(() => usePage());
      expect(result2.current).toBe(1);

      mockSearchParams.set("page", "-1");
      const { result: result3 } = renderHook(() => usePage());
      expect(result3.current).toBe(1);
    });

    it("uses custom pagingSearchParam", () => {
      mockSearchParams.set("customPage", "5");
      const { result } = renderHook(() => usePage("customPage"));
      expect(result.current).toBe(5);
    });
  });

  describe("usePaginatedQuery", () => {
    const mockQuery = jest
      .fn()
      .mockReturnValue({ queryKey: ["test"], queryFn: jest.fn() });
    const mockPrefetch = jest.fn().mockReturnValue([]);

    beforeEach(() => {
      (useQuery as jest.Mock).mockReturnValue({ data: "test" });
      (useQueries as jest.Mock).mockReturnValue([]);
    });

    it("calls query with current page", () => {
      mockSearchParams.set("page", "2");
      renderHook(() =>
        usePaginatedQuery({
          query: mockQuery as MockQuery,
          prefetch: mockPrefetch as MockPrefetchQuery,
        })
      );
      expect(mockQuery).toHaveBeenCalledWith(2);
      expect(useQuery).toHaveBeenCalledWith(mockQuery(2));
    });

    it("calls prefetch with current page", () => {
      mockSearchParams.set("page", "2");
      renderHook(() =>
        usePaginatedQuery({
          query: mockQuery as MockQuery,
          prefetch: mockPrefetch as MockPrefetchQuery,
        })
      );
      expect(mockPrefetch).toHaveBeenCalledWith(2);
      expect(useQueries).toHaveBeenCalledWith({ queries: mockPrefetch(2) });
    });

    it("uses default page 1 when no param", () => {
      mockSearchParams.delete("page");
      renderHook(() =>
        usePaginatedQuery({
          query: mockQuery as MockQuery,
          prefetch: mockPrefetch as MockPrefetchQuery,
        })
      );
      expect(mockQuery).toHaveBeenCalledWith(1);
    });
  });

  describe("usePagingControls", () => {
    beforeEach(() => {
      (usePathname as jest.Mock).mockReturnValue("/test");
    });

    it("generates correct next URL", () => {
      mockSearchParams.set("page", "2");
      const { result } = renderHook(() => usePagingControls());
      expect(result.current.nextUrl).toBe("/test?page=3");
    });

    it("generates correct prev URL", () => {
      mockSearchParams.set("page", "2");
      const { result } = renderHook(() => usePagingControls());
      expect(result.current.prevUrl).toBe("/test?page=1");
    });

    it("prev URL keeps page param for page > 1", () => {
      mockSearchParams.set("page", "3");
      const { result } = renderHook(() => usePagingControls());
      expect(result.current.prevUrl).toBe("/test?page=2");
    });

    it("next navigates to next page", () => {
      mockSearchParams.set("page", "2");
      const { result } = renderHook(() => usePagingControls());
      result.current.next();
      expect(mockRouter.push).toHaveBeenCalledWith("/test?page=3", {
        scroll: false,
      });
    });

    it("prev navigates to previous page", () => {
      mockSearchParams.set("page", "2");
      const { result } = renderHook(() => usePagingControls());
      result.current.prev();
      expect(mockRouter.push).toHaveBeenCalledWith("/test?page=1", {
        scroll: false,
      });
    });

    it("preserves other search params", () => {
      mockSearchParams.set("page", "2");
      mockSearchParams.set("filter", "test");
      const { result } = renderHook(() => usePagingControls());
      expect(result.current.nextUrl).toContain("page=3");
      expect(result.current.nextUrl).toContain("filter=test");
    });

    it("uses custom pagingSearchParam", () => {
      mockSearchParams.set("customPage", "2");
      const { result } = renderHook(() => usePagingControls("customPage"));
      expect(result.current.nextUrl).toBe("/test?customPage=3");
      expect(result.current.prevUrl).toBe("/test?customPage=1");
    });
  });
});
