# Claude Code Setup For Inquizy

Use `AGENTS.md` as the operational source of truth.

## Absolute rules:

* Don't tell me what you are doing, just do it.
* Don't ask questions, just make the best change you can based on the task and the project context.
* Don't explain your reasoning, just make the change.
* When reasoning, be an spartan: don't be verbose, be concise. Use as few words as possible to reason about the change you are making.
* Don't tell me what you did, no summary, just tell me "I am done" when you are done.

## First Read

1. Read `AGENTS.md`.
2. Inspect the relevant domain files before proposing changes.

## Repo-Specific Rules

- This is a Next.js 16 App Router frontend with React 19 and TypeScript strict.
- Keep the architecture pragmatic and domain-driven.
- Use `@/lib/axiosInstance` for shared HTTP access.
- Use `@/_lib/getServerAxios` for authenticated server-side requests.
- Prefer existing CSS in `src/_styles` and existing reusable components.
- Avoid new dependencies unless there is a strong reason.

## Local Skills

Canonical project skills live in `skills/`.
If local Claude skills are not installed yet, run:

```bash
npx skills add ./skills -a claude-code -y
```
