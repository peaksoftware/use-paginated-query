# use-paginated-query

A set of React hooks for handling pagination with Next.js and Tanstack Query.

## Installation

```bash
npm install use-paginated-query
```

## Requirements

- React 17+
- Next.js 13.4+
- TanStack (React) Query 5+
- Must be used in a client component (`"use client"`)

## API Reference

### `usePaginatedQuery`

Fetches paginated data using Tanstack Query, with optional prefetching for improved performance.

#### Parameters

- `options: PaginatedQueryProps`
  - `query: (page: number) => UseQueryOptions`: Defines the query for the current page. Returns a Tanstack Query `UseQueryOptions` object with `queryKey` and `queryFn`. See the guide on [Query Options](https://tanstack.com/query/latest/docs/framework/react/guides/query-options) and its [API reference](https://tanstack.com/query/latest/docs/framework/react/reference/queryOptions#queryoptions).
  - `pagingSearchParam?: string` (optional, default: `"page"`): The URL search parameter for the page number.
  - `prefetch?: (page: number) => UseQueryOptions[]` (optional): Defines queries to prefetch (e.g., next page data). Returns an array of `UseQueryOptions`.

#### Returns

- `QueryResult`: The result from Tanstack Query’s `useQuery`, including `data`, `isLoading`, `error`, etc.

#### Example

```tsx
"use client";
import { usePaginatedQuery } from "use-paginated-query";

export default function Page() {
  const { data, isLoading } = usePaginatedQuery({
    query: (page) => ({
      queryKey: ["data", page],
      queryFn: async () => {
        const res = await fetch(`/api/data?page=${page}`);
        return res.json();
      },
    }),
    prefetch: (page) => [
      {
        queryKey: ["data", page + 1],
        queryFn: async () => {
          const res = await fetch(`/api/data?page=${page + 1}`);
          return res.json();
        },
      },
    ],
  });

  if (isLoading) return <p>Loading...</p>;

  return <p>Data: {JSON.stringify(data)}</p>;
}
```

### `usePagingControls`

Provides controls for navigating between pages, updating the URL’s page parameter.

#### Parameters

- `pagingSearchParam?: string` (optional, default: `"page"`): The URL search parameter for the page number.

#### Returns

- `object`:
  - `next: () => void`: Navigates to the next page.
  - `prev: () => void`: Navigates to the previous page.
  - `nextUrl: string`: The URL for the next page.
  - `prevUrl: string`: The URL for the previous page.

#### Example

```tsx
"use client";
import { usePagingControls } from "use-paginated-query";

export function PagingControls() {
  const { next, prev, nextUrl, prevUrl } = usePagingControls();

  return (
    <div>
      <button onClick={prev}>Previous</button>
      <button onClick={next}>Next</button>
      <p>Next URL: {nextUrl}</p>
      <p>Prev URL: {prevUrl}</p>
    </div>
  );
}
```

## Usage

Combine both hooks for a complete pagination experience:

```tsx
"use client";
import { usePaginatedQuery, usePagingControls } from "use-paginated-query";

export default function Page() {
  const { data, isLoading } = usePaginatedQuery({
    query: (page) => ({
      queryKey: ["data", page],
      queryFn: async () => {
        const res = await fetch(`/api/data?page=${page}`);
        return res.json();
      },
    }),
  });

  const { next, prev } = usePagingControls();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <p>Data: {JSON.stringify(data)}</p>
      <button onClick={prev}>Previous</button>
      <button onClick={next}>Next</button>
    </div>
  );
}
```
