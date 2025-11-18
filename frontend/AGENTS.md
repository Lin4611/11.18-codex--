# Repository Guidelines

## Project Structure & Module Organization
This Vite + Vue 3 workspace keeps all runtime code under `src/`. Bootstrap logic lives in `src/main.ts`, routing in `src/router/index.ts`, and shared styles in `src/styles/main.css`. Organize features in subfolders that co-locate `.vue`, composables, and tests; keep long-lived assets in `public/` and planning artifacts in `docs/`.

## Build, Test, and Development Commands
- `npm run dev`: Start the Vite dev server with hot module reload.
- `npm run build`: Run Vue type-checking (`vue-tsc --build`) and then `vite build` for a production bundle in `dist/`.
- `npm run preview`: Serve the already-built bundle locally to validate production output.
- `npm run type-check`: Execute TypeScript checking alone when iterating on types or APIs.

## Coding Style & Naming Conventions
Write Vue Single File Components in `<script setup lang="ts">` form when possible, keep indentation at two spaces, and prefer named exports for composables. Component files use `PascalCase.vue`, reusable utilities use `camelCase.ts`, and route names stay kebab-case (`todo-list`). Favor Tailwind utility classes with brief grouping comments for dense templates, and run `npm run build` before opening a PR so the type-checker stays green.

## Testing Guidelines
Formal unit tests are not yet configured, so rely on `npm run type-check` plus manual verification via `npm run preview`. When adding tests, align with Vitest (`*.spec.ts`) stored near the unit under test or in `src/__tests__/`, and document DOM expectations so future Playwright scenarios inherit the intent. Call out uncovered paths in the PR description until full coverage tooling lands.

## Commit & Pull Request Guidelines
Git history demonstrates Conventional Commits (e.g., `feat: integrate Tailwind CSS into the frontend`), so continue using `feat|fix|chore|docs(scope): summary` with the imperative mood. Each PR should describe the UI or API impact, reference any tracked issue, and include screenshots or terminal logs for visual or CLI-facing changes. Confirm that `npm run build` and a quick `npm run preview` smoke test pass locally and list follow-up work if scope was deferred.

## Configuration & Secrets
Environment typing lives in `env.d.ts`; any runtime configuration must be exposed through `VITE_*` variables so Vite can inline it. Store actual values in a developer-local `.env` ignored by Git, and mention new `VITE_` entries in PRs so deployment pipelines stay aligned.
