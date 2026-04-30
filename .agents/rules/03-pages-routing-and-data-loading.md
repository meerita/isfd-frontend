# Pages Routing And Data Loading

## Page Responsibilities

- Keep `page.tsx` focused on parsing search params, loading data, and composing sections.
- Fetch data in the page with server actions or server-side helpers, not with client-side effects.
- Keep small parsing helpers close to the page when they are page-specific.
- Use `Promise.all` when the page needs multiple independent requests.
- Keep pagination, filter parsing, and URL reconstruction inside the route layer.
- Keep shared route chrome in `layout.tsx`, not in page-level wrapper components.
- Keep data that depends on changing `searchParams` in `page.tsx` or a client component, not in `layout.tsx`, because layouts do not re-render on navigation.

## Page Structure

- Build pages with existing layout primitives such as `Grid`, `Main`, `SectionHeader`, `Table`, `Tbody`, `Row`, `Cell`, `Text`, and `Button`.
- Use route-local `_components` for filters, toggles, delete buttons, and forms.
- Keep empty states and API error states simple and inline in the page using existing typography/layout primitives.
- Do not build a local `PageLayout`, `PageWrapper`, `LoadingWrapper`, or similar abstraction if `layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, or `not-found.tsx` can express the behavior directly.

## Routing Rules

- Use `NAVIGATION` constants for route generation instead of inline path strings.
- Keep search param names aligned with backend expectations, for example `page_size`, `country_id`, `federation_level`.
- Validate and normalize search params before using them.
- Keep reusable path/query constants out of JSX when they are used more than once.
- Use route groups when you need to organize or scope layouts without changing the URL.
- Use private folders such as `_components` and `_lib` for route-local internals instead of inventing routing-safe naming patterns.

## Loading Rule

- Do not render custom loading markup inside `page.tsx` for route loading.
- Prefer `loading.tsx` for route-segment loading states because Next.js automatically wires it as a Suspense boundary.
- The current repo may use toast-only `loading.tsx` files in some routes, but that is a route-specific pattern, not a general rule to wrap or replace Next.js loading conventions.
- If loading UI is needed for data inside `layout.tsx`, move the uncached fetch into `page.tsx` or wrap the layout sub-tree in its own `Suspense` boundary instead of building custom route wrappers.