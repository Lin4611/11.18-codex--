# Repository Guidelines

## Project Structure & Module Organization
- `app.js` is the composition root; register middleware, views, and routers here and keep business logic in helper modules (add `lib/` if needed).
- `bin/www` starts the HTTP server and is the only file that should read `process.env.PORT` or touch the Node `http` API.
- Routers belong in `routes/<resource>.js`; keep each focused on a coherent path group and export small handler functions for reuse.
- Jade templates live in `views/` with `layout.jade` sharing chrome, while all static files are served from `public/` (`images/`, `javascripts/`, `stylesheets/`).

## Build, Test, and Development Commands
```bash
npm install                # install dependencies
npm start                  # launch the server via bin/www (defaults to PORT=3000)
PORT=4000 npm start        # run on a different port
DEBUG=backend:* npm start  # emit verbose debug logs
```
Add new tooling as npm scripts (`npm run lint`, `npm run seed`) so contributors share the same entry points.

## Coding Style & Naming Conventions
Use 2-space indentation, semicolons, and CommonJS modules. Prefer `const`/`let` in new code, but avoid drive-by rewrites of legacy `var` sections. Name routers with plural resources (`routes/users.js`), Jade templates in lowercase-with-hyphens, and utility modules under `lib/<feature>.js`. Once ESLint is wired up, run `npx eslint .` before every commit.

## Testing Guidelines
There is no bundled test runner, so every functional change must add coverage alongside the code. Favor Jest or Mocha with Supertest, put specs in `tests/` as `<feature>.test.js`, and export helpers so tests can import them without booting the server. Configure `npm test` (example: `mocha "tests/**/*.test.js"`) and aim for roughly 80% statement coverage, especially across routes and error handlers. When changing Jade templates, attach manual verification notes or screenshots until UI tests exist.

## Commit & Pull Request Guidelines
The existing history (`init`) shows concise imperative commits; continue that style (`verb-object`, ≤72 characters, optional wrapped body). Each PR must explain what changed, why, and how it was validated, reference any related issues, and provide curl samples or screenshots when HTTP payloads or views change. Keep commits logically grouped; squash only if it improves clarity.

## Security & Configuration Tips
Never commit secrets; pass them through environment variables consumed in `app.js` or helper modules and document new keys in the PR (plus `.env.example` if introduced). Validate inbound JSON in routers, sanitize any future database inputs, and leave the production error-hiding logic untouched so stack traces do not leak.
