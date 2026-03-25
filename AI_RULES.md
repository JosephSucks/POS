# AI Rules

## Tech stack

- **Next.js 15** with the **App Router** (`app/` directory) for pages, layouts, loading states, route handlers, and navigation.
- **React 19** with **TypeScript** in **strict mode** for all application code.
- **Tailwind CSS 3** for all styling, with design tokens and theme values defined through CSS variables.
- **shadcn/ui** as the default component library, built on top of **Radix UI** primitives already installed in the project.
- **Lucide React** for icons.
- **Neon PostgreSQL** via `@neondatabase/serverless` for database access.
- **Next.js Route Handlers** in `app/api/**/route.ts` for server-side API endpoints and database-backed operations.
- **next-themes** for theme handling, with the existing `ThemeProvider` already wired into the root layout.
- **react-hook-form** with **zod** and `@hookform/resolvers` for forms that need validation.
- **date-fns**, **recharts**, **sonner**, and **swr** are available for date formatting, charts, toast notifications, and client-side data fetching when needed.

## Library usage rules

### Core app structure

- Use **Next.js App Router conventions** only. Put pages in `app/**/page.tsx`, layouts in `app/**/layout.tsx`, and API handlers in `app/api/**/route.ts`.
- Use **TypeScript** for all new code. Do not add plain JavaScript files for app logic or UI.
- Use the `@/*` import alias for internal imports when possible.

### Styling

- Use **Tailwind CSS** for layout, spacing, typography, colors, and responsive behavior.
- Prefer the project theme tokens such as `bg-background`, `text-foreground`, `text-muted-foreground`, `border-border`, and `bg-primary` instead of hard-coded colors.
- Do not introduce CSS-in-JS or additional styling libraries unless there is a strong existing reason in the codebase.

### UI components

- **Prefer shadcn/ui components first** for buttons, inputs, cards, dialogs, dropdowns, tables, tabs, forms, alerts, sheets, drawers, and similar UI.
- Reuse components from `@/components/ui/*` before building custom primitives.
- Use **Radix UI** only through the existing shadcn/ui layer unless a required primitive does not already exist.
- Use **Lucide React** for icons. Do not introduce a second icon library.

### Forms and validation

- Use **react-hook-form** for non-trivial forms.
- Use **zod** for schema validation and `@hookform/resolvers` to connect schemas to forms.
- For very small forms with minimal logic, simple controlled React state is acceptable.

### Data fetching and server access

- Put database access on the **server side** only.
- Use **Next.js route handlers** for API endpoints that read or write data.
- Use `@neondatabase/serverless` for PostgreSQL queries.
- Do not access secrets or database credentials from client components.
- For client-side remote data fetching, prefer **SWR** when caching or revalidation is useful.

### Navigation and Next.js features

- Use **`next/navigation`** for routing and navigation in client components.
- Use **`next/font`** for fonts when adding or changing typography setup.
- Keep shared providers in the existing layout/provider structure instead of duplicating them per page.

### Feedback and visualization

- Use the existing **toast system** (`@/components/ui/toaster` and/or `sonner`) for user notifications instead of browser alerts.
- Use **Recharts** for charts and dashboards.
- Use **date-fns** for date parsing, formatting, and date math instead of handwritten utilities.

## Preferred decision order

When multiple options are possible, choose in this order:

1. **Next.js built-ins**
2. **shadcn/ui** components already in the repo
3. **Tailwind CSS** utilities
4. **Project-installed libraries** already present in `package.json`
5. A new dependency only if the existing stack cannot reasonably solve the task

## Avoid

- Do not add React Router; this app already uses **Next.js routing**.
- Do not add another component library.
- Do not add another icon library.
- Do not add another form library if `react-hook-form` + `zod` can handle the use case.
- Do not move database logic into client components.
- Do not bypass the design system with inconsistent ad hoc UI when a shadcn/ui component already exists.
