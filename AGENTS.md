# AGENTS.md

Client-only React 19 + Vite + Tailwind v4 SPA of developer tools. No backend,
no server code; all logic is pure functions in `src/lib/`.

## Commands

| Command | Notes |
| ------- | ----- |
| `npm run dev` | Vite dev server (default http://localhost:5173). |
| `npm run build` | `tsc -b && vite build`. **This is the only typecheck** — no separate typecheck script. |
| `npm run lint` | Oxlint (`.oxlintrc.json`), not ESLint. Does not typecheck. |
| `npm run preview` | Serve the production build. |

There is **no test runner and no test files**; do not invent `npm test`. Verify
changes with `npm run build && npm run lint`.

## TypeScript gotchas

- `verbatimModuleSyntax` is on: type-only imports must use `import type`.
- `erasableSyntaxOnly` is on: no `enum`, no namespaces, no parameter properties.
- `noUnusedLocals` / `noUnusedParameters` fail the build.
- `tsc -b` builds two projects (`tsconfig.app.json` for `src`, `tsconfig.node.json`
  for `vite.config.ts`).

## Adding a tool

1. Add pure logic as a module in `src/lib/` (e.g. `src/lib/jsonDiff.ts`).
2. Add the component `src/tools/MyTool.tsx` (default export).
3. Register it in `src/tools/registry.ts` (`TOOLS`). The list is sorted by
   `name` at module load, so order in the array doesn't matter; Home search and
   the sidebar pick it up automatically. Routes are `/tools/:toolId`.

## UI / styling

- Tailwind v4 is wired via `@tailwindcss/vite`; there is no `tailwind.config`.
  Theme tokens live in `src/index.css` (`@theme`).
- **`slate-*` is inverted from Tailwind's default**: lower number = darker
  (`slate-100` is primary text, `slate-950` is the page background). `indigo-*`
  is the blue accent. Don't assume stock Tailwind colors.
- `DESIGN.md` is the source of truth for the skeuomorphic design system. Reuse
  shared components (`Panel`, `TitleBar`, `Button`, `Badge`, `ErrorNote`,
  `SearchInput`, `TextEditor`, `SplitPane`, `ToolHeader`) before adding new
  chrome; `src/index.css` holds the CSS for `.window`, `.title-bar`, etc.
- `SplitPane` persists its ratio in `localStorage` under `toolbox.split.<id>` —
  always pass a stable, unique `id`.
- Tool views use `SplitPane`; errors are shown via `ErrorNote`.

## Deploy

- Cloudflare Workers with static assets, configured by `wrangler.jsonc`
  (`assets.directory: ./dist`). Build `npm run build`, deploy `npx wrangler deploy`.
- SPA fallback is `assets.not_found_handling: "single-page-application"`.
  Do **not** add a `/* /index.html 200` `_redirects` rule — Workers rejects it as
  an infinite loop (`code: 100324`). Cloudflare Pages (classic) is the opposite.
- Push to `master` deploys production; PRs get preview URLs.
- PWA manifest/service worker are configured in `vite.config.ts`
  (`vite-plugin-pwa`/Workbox); the production build runs offline.
