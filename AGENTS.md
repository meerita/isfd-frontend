# ISFD Frontend Agent Guide

This file is the shared operational guide for coding agents working in this repository.
Use it together with `PROMPT.md`.

## Source of Truth

- Follow explicit user instructions first.
- Use this file for repository workflow and operational rules.
- Use `PROMPT.md` for project-specific coding conventions and quality constraints.
- Prefer existing code patterns over inventing new abstractions.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript strict
- Bun available for local scripts
- Axios for HTTP
- Global CSS files under `src/_styles`

## Commands

Run these from the repository root:

```bash
bun dev
bun run build
bun run lint
bun run check:types
bun run skills:list
bun run skills:install
```

Known issue:

- `bun run check:types` may currently fail because generated `.next/types/validator.ts` contains route typing mismatches unrelated to most feature work.

## Repository Map

- `app/`: App Router routes, layouts, pages, route handlers
- `src/_actions/`: server actions grouped by domain
- `src/_components/`: reusable UI components
- `src/_constants/`: catalogs and shared labels/config values
- `src/_helpers/`: utility helpers and AI prompt helpers
- `src/_lib/`: shared auth and server-side helpers
- `src/lib/axiosInstance.ts`: shared Axios client base
- `src/_styles/`: project CSS layers
- `src/_types/`: domain types and DTO-like frontend models

## Working Rules

- Keep changes pragmatic and domain-oriented. Do not introduce Clean Architecture layers.
- Keep TypeScript strict. Do not use `any` or `@ts-ignore`.
- Use internal imports with `@/*` aliases.
- Use `'use client'` only when browser APIs, stateful interactivity, or effects require it.
- Reuse values from `src/_constants` instead of introducing magic strings.
- Reuse styles from `src/_styles` and existing components before creating new patterns.
- Keep comments in English and only when they explain intent or a non-obvious constraint.

## Data And Auth Rules

- Client and shared HTTP access must go through `@/lib/axiosInstance`.
- Server-authenticated requests should use `@/_lib/getServerAxios` when request-scoped auth headers are needed.
- Do not mutate the shared Axios instance with per-request auth headers.
- Keep JWT/session handling inside existing auth helpers rather than duplicating token parsing logic.

## Change Workflow

1. Inspect existing domain files before editing.
2. Make the smallest coherent change that solves the request.
3. Validate with the narrowest useful command first.
4. Mention any known unrelated failures instead of trying to fix the whole repo.

## Skills

Project skills live in `skills/`.

Install them into local agent-specific folders with:

```bash
npx skills add ./skills -a claude-code -a codex -a github-copilot -y
```

Use `--copy` if symlinks are undesirable in the local environment.
