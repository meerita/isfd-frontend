# Claude Code Setup For Inquizy

Use `AGENTS.md` as the operational source of truth and `PROMPT.md` as the detailed project prompt.

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
