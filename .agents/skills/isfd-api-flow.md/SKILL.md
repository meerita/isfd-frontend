---
name: isfd-api-flow
description: 'Use when building or refactoring ISFD server actions, Axios calls, authenticated data loading, JWT-aware flows, API integration, or error handling around backend requests.'
---

<!-- @format -->

# ISDF API And Server Action Workflow

## When to Use

Use this skill for any task that touches backend communication, auth-aware requests, server actions, or error normalization.

## Steps

1. Find whether the change belongs in `src/_actions/`, `src/_lib/`, `src/lib/axiosInstance.ts`, or a domain helper.
2. Use `@/lib/axiosInstance` for shared HTTP behavior.
3. Use `@/_lib/getServerAxios` for per-request authenticated server access.
4. Keep token/session logic inside the existing auth helpers instead of re-parsing JWTs elsewhere.
5. Normalize or surface errors consistently with existing project patterns instead of ad hoc response parsing.
6. Keep API-specific strings, statuses, and labels aligned with `src/_constants` and existing types in `src/_types`.

## Guardrails

- Do not mutate the shared Axios client with request-specific auth headers.
- Do not call backend endpoints directly from arbitrary components when a server action or helper already fits the pattern.
- Do not spread raw backend shapes through the UI if an existing frontend type already models the response.
