# Components Layout And Styling

## Reuse Existing Components

- Check `src/_components` before creating new UI.
- The default building blocks are already in the repo: layout primitives, typography, forms, navigation helpers, tables, and small status/icon components.
- Prefer composition of existing components over one-off JSX and inline styling.

## Important Primitives

- Layout: `Grid`, `Main`, `Section`, `SectionHeader`, `Header`, `Box`.
- Typography: `Title`, `Text`.
- Forms: `Form`, `Button`, `TextInput`, `TextArea`, `Select`, `CheckBoxInput`, `Fieldset`.
- Navigation/UI: `ButtonGroup`, `Icon`, `Dot`, `Card`, table primitives.

## Styling Rules

- Reuse the existing utility-class system and constants under `src/_constants` and `src/_styles`.
- Do not introduce a separate styling approach for a small feature.
- Avoid inline styles unless the existing file already uses them for tiny visual previews such as image/icon placeholders.
- Keep new class composition consistent with existing component patterns.

## Data And HTTP

- Shared HTTP access must go through `@/_lib/axiosInstance`.
- Server-authenticated requests must use `@/_lib/getServerAxios`.
- Do not mutate the shared Axios instance with request-specific auth headers.
- Keep auth and token logic inside existing auth helpers.

## Final Check Before Writing Code

- Reuse constants before adding strings.
- Reuse components before adding markup.
- Reuse action and payload patterns before inventing new data flow.
- Reuse the `countries`, `stadiums`, and `federations` feature patterns before introducing a new one.