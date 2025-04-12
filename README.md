# use-paginated-query

A set of React hooks for handling pagination with the Next.js App Router and Tanstack Query.

## Installation

```bash
npm install use-paginated-query
```

## Usage

These hooks are designed for **client-side use only** and must be used in a Next.js client component (a file with `"use client"` at the top).

```tsx
"use client";
import { usePaginatedQuery, usePagingControls } from "use-paginated-query";

export default function Page() {
  const { data } = usePaginatedQuery({
    query: (page) => ({
      queryKey: ["data", page],
      queryFn: fetchData,
    }),
  });
  const { next, prev } = usePagingControls();

  return (
    <div>
      <p>Data: {JSON.stringify(data)}</p>
      <button onClick={prev}>Previous</button>
      <button onClick={next}>Next</button>
    </div>
  );
}
```

## Requirements

- React 17+
- Next.js 13.4+
- @tanstack/react-query 5+
- Must be used in a client component (`"use client"`)

##
