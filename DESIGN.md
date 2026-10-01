# Design

Toolbox uses a light **skeuomorphic** skin (circa 2010–2013 desktop UI):
glossy gradients, beveled controls, inset fields, soft drop shadows and a
subtle woven background. It is a single theme with one accent color (blue).

Source of truth is `src/index.css` plus the shared components in
`src/components/`. This document describes the rules those files implement.

## Principles

- **One accent.** Blue (`#2a7fd4`) is the only brand color. Everything else is
  neutral gray, or a semantic status color (see [Color](#color)).
- **Chrome lives on windows.** Elevated surfaces use the `.window` chrome;
  controls inside them are glossy and inset.
- **Headers are uniform.** Every panel header is `[title] — [actions]`, actions
  pushed to the right.
- **Two radii.** 8px for windows, 6px for controls/content (menu links use 4px).
- **Monospace for data, sans for UI.** JSON, diffs and tokens render in
  monospace; chrome and labels use the system UI font.

## Typography

Defined in `src/index.css` (`@theme`).

| Token          | Stack |
| -------------- | ----- |
| `--font-sans`  | `Lucida Grande, Lucida Sans Unicode, Segoe UI, Frutiger, Helvetica Neue, Arial, sans-serif` |
| `--font-mono`  | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |

- `body` uses `--font-sans`.
- `pre`, `textarea`, `code` use `--font-mono`.
- `h1`/`h2` get an embossed `text-shadow: 0 1px 0 rgba(255,255,255,.85)`.

| Role | Classes |
| ---- | ------- |
| Page/tool title | `text-xl font-semibold` (`ToolHeader`); home hero `text-3xl font-bold` |
| Description / secondary | `text-sm text-slate-400` |
| Panel header label | `text-xs font-semibold` (inside `TitleBar`) |
| Body / data | `text-xs` / `text-sm` monospace (`pre`, diff rows) |

## Color

Tailwind tokens are remapped in `src/index.css` (`@theme`) so utilities map to
the skeuomorphic palette. `slate-*` is a light-to-dark gray ramp and
`indigo-*` is the blue accent.

### Neutrals (`slate`)

| Token | Hex | Typical use |
| ----- | --- | ----------- |
| `slate-950` | `#d9dce1` | page background base |
| `slate-900` | `#eceef1` | sidebar / scrollbar track |
| `slate-800` | `#a8adb5` | borders |
| `slate-700` | `#c4c8ce` | (borders/accents) |
| `slate-600` | `#71767e` | dim text |
| `slate-500` | `#5f646b` | muted text |
| `slate-400` | `#4a4e55` | secondary text |
| `slate-300` | `#34383e` | strong secondary text |
| `slate-200` | `#2b2e33` | data text on light |
| `slate-100` | `#22252a` | primary text |

> Note: the ramp is intentionally inverted from Tailwind's default (lower number
> = darker) so existing `text-slate-100` reads as the primary text color.

### Accent (`indigo`)

| Token | Hex |
| ----- | --- |
| `indigo-300` | `#1c5fa8` |
| `indigo-400` / `indigo-600` | `#2a7fd4` |
| `indigo-500` | `#2f80cf` |
| `indigo-700` | `#1c5fa8` |

The accent drives primary buttons, active nav/segmented state, focus rings,
selection and links.

### Status / semantic

Semantic colors are single-sourced in `src/components/tones.ts` and used for
diff entries, counts, badges and errors:

| Tone | Text | Background | Border |
| ---- | ---- | ---------- | ------ |
| added / success | `text-emerald-700` | `bg-emerald-500/10` | `border-emerald-500/30` |
| removed / danger | `text-rose-700` | `bg-rose-500/10` | `border-rose-500/30` |
| changed | `text-amber-700` | `bg-amber-500/10` | `border-amber-500/30` |
| moved | `text-sky-700` | `bg-sky-500/10` | `border-sky-500/30` |

`emerald-*`, `rose-*`, `amber-*`, `sky-*` and `violet-*` also have per-token
overrides in `@theme` for use outside `tones.ts`.

### Background

The desktop is a fixed woven texture + radial highlight (`body` in
`src/index.css`): a faint 2px grid over a light radial gradient
(`#f6f7f9 → #cfd2d8`). Overlays of `bg-slate-900/NN` sit on top to make regions
recede.

## Shape & elevation

### Radii

| Surface | Radius | Where |
| ------- | ------ | ----- |
| Windows / panels | `8px` | `.window` |
| Buttons, inputs, badges, nav items, content blocks | `6px` | `button`, form fields, `.badge`, `.nav-item`, `rounded-md` |
| Menu-bar link hover | `4px` | `.menu-bar a:hover` |

Do not introduce other radii.

### Borders

- Windows: `1px solid #8f959d`.
- Title bars / menu bar: bottom `1px solid #9aa0a8`.
- Controls: `1px solid #9aa0a8`.
- Dividers / sub-bars: `border-slate-800` (`#a8adb5`).

### Elevation & gloss

- **Window:** inset top highlight + `0 5px 14px rgba(0,0,0,.22)`.
- **Title bar / menu bar:** inset top highlight + subtle bottom inset line.
- **Buttons:** vertical gloss gradient, inset highlight, drop shadow, plus a
  `::after` sheen (`linear-gradient(rgba(255,255,255,.7) → transparent 55%)`).
- **Primary button:** blue gradient + `0 0 8px rgba(59,143,217,.35)` glow.
- **Active/pressed:** darker gradient with an inset shadow (inversion).

## Sizing

| Element | Height |
| ------- | ------ |
| Top menu bar (`.menu-bar`) | `min-height: 2.5rem` (40px) |
| Panel title bar (`.title-bar`) | `min-height: 2.5rem` (40px) |
| Sidebar header | `min-h-12` (48px) |
| Page breadcrumb bar | `min-h-12` (48px) |

The sidebar header and the page breadcrumb are the two 48px bars; they sit
directly under the 40px top menu bar.

Controls:

| Size | Classes | Use |
| ---- | ------- | --- |
| `md` (default) | `px-3 py-2 text-sm` | header/toolbar buttons, tabs |
| `sm` | `px-2 py-0.5 text-xs` | copy buttons, install, title-bar actions |

Panel bodies use `p-3`; card bodies `p-4`; page content `p-4`. Tool roots use
`gap-4`; tool grids are `grid gap-4 lg:grid-cols-2`.

## Components

All shared UI lives in `src/components/`.

### Panel — `Panel.tsx`

Renders `<section className="window …">`. Use for any elevated surface. Pass
layout via `className` (e.g. `flex min-h-0 flex-col`).

### TitleBar — `TitleBar.tsx`

```tsx
<TitleBar title="Output">
  <Button size="sm" onClick={copy}>Copy</Button>
</TitleBar>
```

Renders the label followed by an actions group pushed right with `ml-auto`.
**Rule:** title on the left, all actions (buttons, selects, badges) in the
right-hand group. Never add `ml-auto` yourself. Actions always right-align,
including selects — e.g. the JWT "Algorithm" and "Verify signature" selects.

### Button — `Button.tsx`

```tsx
<Button onClick={…}>Ghost</Button>
<Button variant="primary" onClick={…}>Primary</Button>
<Button size="sm" onClick={…}>Small</Button>
```

- Props extend native `<button>` attributes; `variant` (`ghost` | `primary`)
  maps to `data-variant`, `size` (`sm` | `md`).
- `primary` is the filled blue action (one per screen/panel).
- Use `className="plain"` only for inline link-style buttons.

### Badge — `Badge.tsx`

`<Badge tone="added">+ 3 added</Badge>`. Tones come from `tones.ts`. Used for
diff counts and the JWT valid/expired state.

### ErrorNote — `ErrorNote.tsx`

The single error presentation: boxed, rose-tinted, monospace, pre-wrapped
(`text-rose-700`). Use it for all parse/verification errors.

### TextEditor — `TextEditor.tsx`

`Panel` + `TitleBar` + a flush `<textarea>` (white document area, no radius,
blue inset focus ring via `.window > textarea`). Used for all text/JSON/token
inputs.

### ToolHeader — `ToolHeader.tsx`

The per-tool page hero: `h1` + description on the left, action buttons on the
right. Every tool starts with it.

### Sidebar — `ToolSidebar.tsx`

Left rail (`w-56`, collapsible to `w-12`). Header (48px) with a "Tools" label
and a collapse toggle; a "Search tools..." filter (hidden when collapsed);
then `NavLink`s styled with `.nav-item`. The active item is a glossy blue pill
(`.nav-item-active`); collapsed items show initials.

### Menu bar — `Layout.tsx`

App-level top bar (`.menu-bar`): brand link, install button, "All tools" link
and a tool count. Metal gradient with hover-highlighted links.

## Layout

```
Layout
├─ header.menu-bar            (40px, full width)
└─ main
   └─ ToolPage
      ├─ ToolSidebar          (header 48px + search + nav)
      └─ content
         ├─ breadcrumb bar    (48px: "← All tools / <tool>")
         └─ tool view         (p-4)
```

Routing (see `src/App.tsx`): `/` is the Home grid with search; each tool is at
`/tools/:toolId`.

## Interaction states

- **Hover:** subtle lighten (buttons) or `rgba(0,0,0,.08)` (menu links) /
  `rgba(0,0,0,.06→.02)` (nav items).
- **Active/pressed:** inverted gradient + inset shadow.
- **Focus:** text fields get a blue border + `0 0 0 3px rgba(42,127,212,.3)`
  ring; other controls rely on native focus with `outline: none` where a custom
  style is applied.
- **Disabled:** buttons `opacity: .5; pointer-events: none`; fields `opacity: .6`
  (`cursor: not-allowed`).
- **Selection:** `rgba(42,127,212,.3)` background.

## Scrollbars

Styled globally: 14px light track (`.window > textarea` inset) with a rounded
gray gradient thumb (`background-clip: content-box`).

## Accessibility notes

- Body text is dark (`slate-100` `#22252a`) on light surfaces; semantic text
  uses the `-700` shades for contrast.
- Focusable fields have a visible blue focus ring; keep it when adding inputs.
- Icon-only buttons must have `aria-label` (see the sidebar toggle and search
  clear).
- The palette is not yet colorblind-optimized for the diff tones (green/red);
  the `+`/`-`/`~`/`→` signs are the redundant cue.

## File map

| File | Responsibility |
| ---- | -------------- |
| `src/index.css` | tokens (`@theme`), background, all chrome/control CSS |
| `src/components/Panel.tsx` | window surface |
| `src/components/TitleBar.tsx` | header rule |
| `src/components/Button.tsx` | buttons (`variant`, `size`) |
| `src/components/Badge.tsx` / `tones.ts` | status chips + tone classes |
| `src/components/ErrorNote.tsx` | error presentation |
| `src/components/TextEditor.tsx` | editor field |
| `src/components/ToolHeader.tsx` | tool hero |
| `src/components/ToolSidebar.tsx` | sidebar nav + search |
| `src/components/Layout.tsx` | top menu bar + outlet |
| `src/pages/ToolPage.tsx` | breadcrumb + content |
| `src/tools/registry.ts` | tool metadata, ordering, search filter |
