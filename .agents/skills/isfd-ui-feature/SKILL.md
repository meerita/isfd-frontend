---
name: isfd-ui-feature
description: 'Use when creating or updating ISFD UI, pages, layouts, forms, reusable React components, App Router screens, or styling with the existing CSS system under src/_styles.'
---

<!-- @format -->

# ISFD UI Feature Workflow

## When to Use

Use this skill for page work, component work, form updates, layout changes, styling adjustments, and accessibility refinements in the frontend.

## Steps

1. Inspect the relevant route under `app/` and the closest reusable components in `src/_components/`.
2. Reuse existing typography, buttons, badges, cards, tables, and form primitives before creating a new component.
3. Keep server and client boundaries explicit. Add `'use client'` only when state, effects, or browser APIs are required.
4. Reuse values from `src/_constants` instead of hardcoding labels or status-like values.
5. Style through the existing CSS files under `src/_styles` or follow the current project patterns used by nearby components.
6. Check accessibility basics such as button semantics, labels, alt text, and keyboard reachability.

## Guardrails

- Do not introduce a new styling system.
- Do not add heavy state libraries for local UI state.
- Prefer readable composition over abstraction for its own sake.
- Keep props fully typed and avoid broad generic data shapes when a concrete local type is clearer.
