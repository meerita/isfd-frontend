# Server Actions Local Debug Logging

## Purpose

- When building or updating server actions, log the outgoing payload and the backend response only in local development.
- These logs exist for local debugging. They must not run in production.

## Local-Only Rule

- Guard debug logs with `process.env.NODE_ENV === 'development'`.
- Never print payload or response logs unconditionally.
- Keep the logging on the server side only.

## What To Log

- Log the normalized payload immediately before the backend request.
- Log the backend response immediately after a successful request.
- Log normalized error details on failure when they help debug the request.

## What Not To Log

- Do not log auth tokens, cookies, passwords, OTP codes, or raw authorization headers.
- Redact or omit sensitive fields before printing payloads or responses.
- Do not surface these debug logs in the UI, toast messages, or returned action state.

## Placement Pattern

- Keep debug logging inside the server action file in `src/_actions/<domain>`.
- Log around the actual HTTP call so the payload and response correspond to the same request.
- Use consistent labels that include the action name and route, for example `console.log('[createFederation] payload', body)`.

## Scope Rule

- Apply this logging rule to server mutations first.
- For server-side fetchers, only add payload/response logging when actively debugging or when the task explicitly asks for it.