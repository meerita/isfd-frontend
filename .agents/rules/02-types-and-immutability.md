# Types And Immutability

## Readonly By Default

- Export domain types as immutable shapes.
- Prefer `Readonly<{ ... }>` for object types.
- Prefer `ReadonlyArray<T>` for arrays returned by the API or accepted by props.
- Mark nested objects as readonly as well. Do not stop at the top level.
- Use readonly props for components, pages, layouts, filters, and helper arguments.

## Patterns To Follow

- Route props and search params should use readonly shapes.
- Query objects passed into server fetchers should use readonly shapes.
- Form prop objects should use readonly shapes.
- Constant lookup tables should use readonly records.
- Keep API response types separate from mutable local UI state.

## Practical Rule

- If data comes from the backend, route params, constants, or component props, treat it as immutable.
- Use mutable state only for actual client interaction managed by hooks such as `useState` or `useActionState`.
- Do not introduce writable domain models unless the file specifically represents a form payload that must be edited before submission.