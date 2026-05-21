# Project Architecture

The app is organized by responsibility:

- `src/app` contains app-level shell components such as `AppLayout`.
- `src/pages` contains route screens grouped by feature: `landing`, `student`, `mentor`, and `admin`.
- `src/components/ui` contains reusable shadcn UI primitives only.
- `src/router` owns route definitions.
- `src/context` owns global client state.
- `src/lib` owns domain helpers and shared utilities.
- `src/mock` owns seed data.
- `src/types` owns shared TypeScript domain types.

For responsive behavior, route pages should prefer shadcn primitives with layout-only Tailwind classes such as `grid`, `gap`, `sm:*`, `md:*`, and `lg:*`. Visual styling should come from the design tokens in `styles/globals.css` and the UI primitives, not one-off color classes.
