---
name: isfd-project-context
description: 'Use when working on the ISFD frontend, Next.js App Router tasks, React 19 changes, TypeScript strict work, Bun-based workflows, or when project-specific architecture and conventions are needed.'
---

<!-- @format -->

# ISFD Project Context

## When to Use

Use this skill when the task is broadly about this repository and you need the project's coding rules, structure, and validation habits before making changes.

Typical triggers:

- ISFD frontend task
- Next.js App Router work
- React component change in this repo
- TypeScript strict issue in ISFD
- Bun workflow or repository validation

## Core Rules

- Keep architecture pragmatic and domain-oriented. Do not add Clean Architecture layers.
- Keep TypeScript strict. Avoid `any` and `@ts-ignore`.
- Use `@/*` aliases for internal imports.
- Use `'use client'` only when needed.
- Reuse `src/_constants`, `src/_components`, `src/_helpers`, and `src/_styles` before adding new patterns.
- Keep comments in English and only for intent or constraints.

## Important Paths

- `app/`: routes and layouts
- `src/_actions/`: server actions
- `src/_components/`: UI building blocks
- `src/_constants/`: shared constant catalogs
- `src/_helpers/`: helpers and prompt utilities
- `src/_lib/`: auth and shared server utilities
- `src/lib/axiosInstance.ts`: shared Axios client
- `src/_styles/`: CSS layers
- `src/_types/`: frontend types

## Validation Habit

1. Inspect the relevant domain code before editing.
2. Keep the change minimal and coherent.
3. Run `bun run lint` for focused verification.
4. Run `bun run check:types` when type coverage matters.
5. If `.next/types/validator.ts` fails with route typing mismatches, treat that as a known unrelated issue unless the task touches routing types.
