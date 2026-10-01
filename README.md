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

## Deploy

Toolbox is a static, client-side SPA, so it deploys to any static host with
HTTPS (required for the service worker / PWA install). The recommended host is
Cloudflare.

### Cloudflare Workers (Git-connected)

Cloudflare deploys this as a Worker with static assets. `wrangler.jsonc`
already declares the output directory and the SPA fallback:

- **Build command:** `npm run build`
- **Deploy command:** `npx wrangler deploy`

1. In the Cloudflare dashboard, go to **Workers & Pages → Create → Connect to
   Git** and select the `toolbox` repository.
2. Set the build command to `npm run build` (and the deploy command to
   `npx wrangler deploy` if prompted).
3. Save and deploy. Every push to `master` publishes to production; pull
   requests get their own preview URL.

The SPA fallback lives in `wrangler.jsonc` as
`assets.not_found_handling: "single-page-application"`, which serves
`index.html` for unmatched paths so client-side routes like `/tools/jwt`
resolve on a cold load or refresh.

> Do not add a `/* /index.html 200` rule to a `_redirects` file for Workers.
> The static-assets router rejects it as an infinite loop (`code: 100324`) —
> use `not_found_handling` instead.

### Custom domain

Open the Worker/project, go to **Settings → Domains & Routes → Add → Custom
domain**, enter your domain, and follow the DNS instructions. HTTPS
certificates are issued automatically. No `base` change is required in
`vite.config.ts` as long as the site is served from the domain root.

### Other hosts

- **Cloudflare Pages (classic):** use the same build settings; Pages expects a
  `public/_redirects` file containing `/* /index.html 200` instead of the
  `wrangler.jsonc` option.
- **Netlify:** `npm run build`, publish `dist`, and add a `public/_redirects`
  file with `/* /index.html 200`.
- **Vercel:** same build settings; add a rewrite of `/(.*)` to `/index.html` in
  `vercel.json`.
- **GitHub Pages:** works, but requires a `404.html` fallback and a Vite `base`
  matching the repo subpath. Cloudflare / Netlify / Vercel are simpler.

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
