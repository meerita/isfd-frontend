# Forms Actions And Mutations

## Form Composition

- Build forms with existing primitives from `src/_components/forms` and layout components from `src/_components/layout`.
- Reuse `Form`, `Button`, `TextInput`, `TextArea`, `Select`, `CheckBoxInput`, `Fieldset`, `ButtonGroup`, `Section`, and `Grid` before adding new primitives.
- Keep route-specific forms in `src/app/<domain>/_components`.
- Prefer one form component that handles create and edit modes through props when the fields are mostly shared.

## Mutation Flow

- Use `useActionState` for form submissions backed by server actions.
- Keep an explicit typed initial state such as `{ status: 'idle' }`.
- Derive `actionState`, `formAction`, and `isPending` from create/edit branches instead of duplicating form markup.
- Disable inputs and submit buttons while pending.
- Use hidden inputs only for server-required identifiers or original values that the action needs.

## Server Actions

- Put mutations in `src/_actions/<domain>` with `'use server'`.
- Use top-level `'use server'` files for reusable server actions imported by client components.
- Use inline server actions only when the action is tightly scoped to a single server component and does not need reuse.
- Parse and validate `FormData` inside payload builders or dedicated helpers, not in the component.
- Return typed action states with `idle | success | error` and the minimal extra data needed by the UI.
- Revalidate the affected navigation paths after successful mutations.
- Normalize API errors through the existing API error helpers instead of inventing new error shapes.
- Authenticate and authorize inside the server action using existing server-side auth helpers. Do not pass auth tokens from the client into the action.
- Return only the data the UI needs. Do not return oversized raw backend payloads when a narrower typed result is enough.

## Navigation After Mutation

- On success, use `toast.success` in the client component and then `router.push`, `router.back`, or `router.refresh` according to the existing route pattern.
- Prefer redirecting to the created entity detail page when the action returns the new id.
- Keep cancel behavior consistent with the existing pattern: `router.back()` when history exists, otherwise push to the list route.