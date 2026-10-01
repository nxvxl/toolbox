# Toolbox

A collection of small developer utilities in a single web app. Everything runs
client-side.

## Tools

| Tool           | Description                                                        |
| -------------- | ------------------------------------------------------------------ |
| JSON Formatter | Beautify, minify, sort keys and validate JSON.                     |
| JSON Diff      | Compare two JSON documents. Arrays are matched by identity/LCS so reorders show as moves instead of noise. |
| Text Diff      | Line-by-line comparison using a Myers diff.                        |
| JWT            | Decode, inspect, sign and verify JSON Web Tokens (`HS*`, `RS*`, `ES*`) via the Web Crypto API. |

## Stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vite.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [React Router](https://reactrouter.com)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL (defaults to http://localhost:5173).

## Install & offline

Toolbox is a Progressive Web App. The production build ships a service worker
(`vite-plugin-pwa` / Workbox) that precaches the app shell, so it runs offline
and can be installed to the home screen or desktop.

To try it:

```bash
npm run build
npm run preview
```

Open the printed URL and use the install button in the browser (address bar or
menu). After the first load it keeps working without a network connection.

## Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the dev server with HMR.       |
| `npm run build`   | Type-check and build for production. |
| `npm run preview` | Preview the production build.        |
| `npm run lint`    | Run Oxlint.                          |

## Project structure

```
src/
  components/   Shared UI (Layout, ToolHeader, TextEditor, ToolSidebar, Button)
  lib/          Pure logic, one module per utility (jsonDiff, jsonFormat, textDiff, jwt)
  pages/        Route views (Home, ToolPage, NotFound)
  tools/        One component per tool + registry.ts
  App.tsx       Routes
  index.css     Theme and global styles
  main.tsx      Entry point
public/         Icons (PWA manifest, favicon, apple-touch-icon)
```

The PWA manifest and service worker are configured in `vite.config.ts`.

Routing is registry-driven: `/` is the landing page with search, and each tool
lives at `/tools/:toolId`.

## Adding a tool

1. Create `src/tools/MyTool.tsx`.
2. Register it in `src/tools/registry.ts`:

```ts
{
  id: 'my-tool',
  name: 'My Tool',
  description: 'What it does.',
  keywords: ['my', 'tool'],
  component: MyTool,
}
```

The landing page, search and sidebar pick it up automatically.

## Notes

- JSON is parsed with `JSON.parse` for correctness; on failure the parse error
  is surfaced to the user.
- JWT signing/verification uses the browser's Web Crypto API, so it works with
  HMAC secrets and PEM-encoded RSA/EC keys.
