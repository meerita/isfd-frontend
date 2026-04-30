# Core And Architecture

## Baseline

- Keep the architecture pragmatic and domain-oriented. Do not add Clean Architecture layers, service wrappers, repositories, factories, or indirection that the repo does not already use.
- Follow existing patterns before inventing new ones. `countries`, `stadiums`, and `federations` are the preferred references for list pages, detail pages, filters, and CRUD forms.
- Follow official Next.js 16 App Router file conventions before inventing wrappers around framework behavior.
- Keep TypeScript strict. Do not use `any`, `@ts-ignore`, or weaken types to silence errors.
- Use internal imports with `@/*` aliases.
- Use English for identifiers, UI copy, and comments.
- Add comments only when they explain intent or a non-obvious constraint.

## File Placement

- Put route files under `src/app`.
- Use Next.js special files when the framework already provides the concern: `layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `route.ts`, metadata files, and route segment config.
- Put reusable UI in `src/_components` first. Do not duplicate UI primitives inside route folders unless the component is truly route-local.
- Put server mutations and server-side fetchers in `src/_actions/<domain>`.
- Put shared constants in `src/_constants` instead of hardcoding repeated strings or option catalogs.
- Put domain types in `src/_types`.
- Put shared helpers in `src/_helpers` or `src/_lib` depending on whether they are pure helpers or infrastructure/auth utilities.

## Client Boundary

- Default to Server Components.
- Add `'use client'` only when the file needs hooks, browser APIs, event handlers, `toast`, or other client-only behavior.
- Do not convert `page.tsx` to client code just to support a form, filter, or loading state. Move that behavior into route-local client components under `_components`.
- Do not create custom wrapper components to simulate route layouts, route loading boundaries, route error boundaries, or metadata handling when Next.js already has a built-in file convention for that job.