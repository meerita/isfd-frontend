# Feedback Loading And Errors

## Toast First

- Use `sonner` toast feedback for async client interactions.
- Prefer `toast.error` and `toast.success` for mutation results.
- For transient route or filter loading feedback, use `toast.loading` with a stable toast id and dismiss it explicitly.
- Do not replace Next.js built-in `loading.tsx` with custom page wrappers or ad hoc client effects just to show loading state.

## Loading Behavior

- Route-level loading should live in `loading.tsx`.
- `loading.tsx` can return `null`, a lightweight skeleton, or other small fallback UI depending on the route need.
- When using the repo's toast-only loading pattern, keep it inside `loading.tsx`; do not reimplement it inside `page.tsx` or a custom wrapper component.
- Filter updates that trigger navigation can use `toast.loading` and `toast.dismiss` around the router transition.
- Keep pending button labels simple, for example `Creating...` or `Updating...`.

## Error Handling

- Resolve backend errors into user-friendly messages before showing them.
- Prefer domain-specific error maps when the backend returns reason codes.
- For server-rendered list/detail pages, show a compact error block with existing `Text`, `Grid`, and `Main` components.
- Do not leak raw unknown errors to the UI when a normalized message already exists.

## Empty States

- Empty states should be plain and functional.
- Reuse placeholders like `--` and short explanatory copy instead of building decorative empty-state UIs.