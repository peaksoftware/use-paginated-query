import {
  useQueries,
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function isValidPagingSearchParam(page: string | null) {
  if (!page) return false;
  const number = Number(page);
  return Number.isInteger(number) && number > 0;
}

interface PaginatedQueryProps<
  TQueryFnData,
  Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
> {
  query: (
    page: number
  ) => UseQueryOptions<TQueryFnData, Error, TData, TQueryKey>;
  pagingSearchParam?: string;
  prefetch?: (
    page: number
  ) => UseQueryOptions<TQueryFnData, Error, TData, TQueryKey>[];
}

function usePage(pagingSearchParam = "page") {
  const searchParam = useSearchParams().get(pagingSearchParam);
  const page = isValidPagingSearchParam(searchParam) ? Number(searchParam) : 1;
  return page;
}

function usePaginatedQuery<
  TQueryFnData,
  Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>({
  query,
  pagingSearchParam = "page",
  prefetch = () => [],
}: PaginatedQueryProps<TQueryFnData, Error, TData, TQueryKey>) {
  const page = usePage(pagingSearchParam);

  useQueries({
    queries: prefetch(page),
  });

  return useQuery(query(page));
}

function usePagingControls(pagingSearchParam = "page") {
  const page = usePage(pagingSearchParam);
  const pathname = usePathname();
  const router = useRouter();

  const searchParams = useSearchParams();
  const nextSearchParams = new URLSearchParams(searchParams.toString());

  const getNextUrl = () => {
    const nextPage = page + 1;
    nextSearchParams.set(pagingSearchParam, nextPage.toString());
    return pathname + "?" + nextSearchParams.toString();
  };

  const getPrevUrl = () => {
    const prevPage = page - 1;
    if (prevPage > 0) {
      nextSearchParams.set(pagingSearchParam, prevPage.toString());
    }
    return pathname + "?" + nextSearchParams.toString();
  };

  const next = () => {
    router.push(getNextUrl(), { scroll: false });
  };

  const prev = () => {
    router.push(getPrevUrl(), { scroll: false });
  };

  return { next, prev, nextUrl: getNextUrl(), prevUrl: getPrevUrl() };
}

export {
  usePaginatedQuery,
  usePage,
  usePagingControls,
  isValidPagingSearchParam,
};
