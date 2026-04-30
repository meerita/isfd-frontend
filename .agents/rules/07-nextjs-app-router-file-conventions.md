# Next.js App Router File Conventions

## Source Of Truth

- Use official Next.js 16 App Router conventions as the default implementation model.
- Do not build custom abstractions for behavior that Next.js already provides through file conventions.
- When in doubt, prefer the framework primitive over a local wrapper.

## Built-In Files To Use

- Use `layout.tsx` for shared UI across a route segment.
- Use `template.tsx` only when a segment must remount and re-render on navigation.
- Use `loading.tsx` for route-segment loading fallbacks.
- Use `error.tsx` for route-segment error boundaries.
- Use `global-error.tsx` only for app-wide error fallback.
- Use `not-found.tsx` for not found UI.
- Use `route.ts` for HTTP endpoints.
- Use metadata exports or `generateMetadata` instead of manually building `<head>` wrappers.

## Layout Rules

- Shared chrome such as headers, nav, sidebars, and shared shells belongs in `layout.tsx`.
- Do not create `PageLayout`, `RouteLayoutWrapper`, `DashboardWrapper`, or similar components to replace a route layout.
- Root layouts must own `<html>` and `<body>`.
- Do not manually add `<head>` tags in layouts. Use the Metadata API.
- Layouts do not re-render on navigation, so do not put search-param-dependent or pathname-dependent logic directly in `layout.tsx`.
- If a layout needs current pathname, selected segment, or search params, move that part into a client component and use the correct Next hook there.

## Route Organization

- Use route groups such as `(admin)` when you need shared layouts without changing the URL.
- Use private folders such as `_components` or `_lib` for route-local implementation details.
- Use parallel routes and intercepted routes only for real slot/modal routing needs, not as a general composition trick.

## Loading And Streaming

- Put route loading state in `loading.tsx`, not inside page wrappers.
- `loading.tsx` automatically becomes the Suspense fallback for the segment.
- If uncached or runtime data is read in `layout.tsx`, `loading.tsx` will not cover that layout work. Either move that fetch to `page.tsx` or wrap the layout sub-tree in `Suspense`.

## Errors And 404s

- Use `error.tsx` and `not-found.tsx` for route-level framework handling.
- Do not simulate route errors or not found handling with custom wrapper components unless there is a narrow UI reason inside an already valid route surface.

## Params And Metadata

- In Next.js 16 App Router, treat `params` as async where applicable and type them accordingly.
- Prefer `LayoutProps` or the framework-generated types when they fit the segment.
- Use `generateMetadata` or static metadata exports for titles, meta tags, and SEO-related route metadata.