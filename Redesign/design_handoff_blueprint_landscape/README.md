# Handoff: FLZ Works — "Blueprint / Landscape" Portfolio Redesign (option 3c)

## Overview
A full redesign of the flz.works portfolio homepage in a **technical-drawing / blueprint** aesthetic: drafting-table blue background with a faint grid, monospace annotations, hairline borders, yellow accent, and an engineering "title block" footer. Layout orientation: **landscape** — a full-width live Sketchfab 3D hero at the top with the headline overlaid, a horizontally scrolling works filmstrip, a single-row social embed strip, then the title-block footer.

## About the Design Files
`design-reference-3c.html` is a **design reference created in HTML** — a prototype showing intended look and behavior, not production code to copy directly. The task is to **recreate this design in the existing flz.works codebase** (Next.js / TypeScript, per the current site) using its established patterns, routing, and image API. Do not ship this HTML as-is.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are final intent — recreate pixel-perfectly, adapting only to the codebase's component conventions.

## Layout (top to bottom)
Whole page background: `#12284B` with a 28px grid drawn via two `linear-gradient` background-images with 1px lines at `rgba(220,231,245,.06)`. Sections separated by dashed dividers `1px dashed rgba(220,231,245,.35)`; major breaks use `1.5px solid #DCE7F5`.

### 1. Top bar
- Flex row, space-between, padding 16px 32px, bottom border `1.5px solid #DCE7F5`.
- Left: boxed "FLZ.WORKS" logo — 1.5px solid border, padding 6px 12px, 11px mono, weight 600.
- Right: nav items `[F] FEATURED · [A] AUTOMOTIVE · [S] SOCIAL · [C] CONTACT`, gap 24px, 11px mono, letter-spacing .1em, 70% opacity; active/CTA item in `#FFD166`. The bracketed letters are keyboard shortcuts — wire real key handlers (F/A/S/C scroll to sections).

### 2. Live 3D hero (full-bleed)
- Sketchfab iframe, full width, height 520px (use `min(60vh, 640px)` in production), bottom border 1.5px solid:
  `https://sketchfab.com/models/cbb1b3572d0545f8a8fdbdb09836ebd6/embed?autostart=0&preload=1&transparent=1&ui_hint=0`
  with `allow="autoplay; fullscreen; xr-spatial-tracking"`. Lazy-load; show a static poster frame until in view.
- Overlaid bottom-left (`pointer-events: none` so orbiting still works):
  - Eyebrow: "DWG NO. FLZ-2026-001 · LIVE MODEL — DRAG TO ORBIT" — 10px mono, letter-spacing .2em, `#FFD166`.
  - Headline: "DRAWN, MODELED, RENDERED." — Space Grotesk 700, 56px, line-height 1, letter-spacing -.02em, `text-shadow: 0 2px 20px rgba(18,40,75,.9)`; final period in `#FFD166`.
- Overlaid bottom-right: stat chips "19 SHEETS" (1px border at 70% foreground) and "5+ YRS" (border + text `#FFD166`), padding 6px 12px, background `rgba(18,40,75,.75)`, also `pointer-events: none`. Keep stats data-driven.

### 3. Works filmstrip (Sheet index)
- Header row: "■ SHEET INDEX — WORKS & LOG" (yellow) left, "SCROLL →" (60% opacity) right; padding 16px 32px; 10px mono, letter-spacing .16em.
- Horizontally scrolling flex row (`overflow-x: auto`, `scroll-snap-type: x mandatory` recommended), gap 14px, padding 0 32px 24px. Feed all 19 projects from the existing portfolio API.
- Card: fixed width 250px, `1px solid rgba(220,231,245,.4)` border; image `aspect-ratio: 16/10; object-fit: cover`; caption bar (padding 7px 9px, 9px mono, letter-spacing .1em, top border same as card) formatted `SHT 00N — TITLE`.
- Images from existing API: `/api/portfolio/media/<slug>/<file>?w=640`.
- Hover: image `filter: brightness(1.08)`, border to `#DCE7F5`, cursor pointer; click → project detail route.

### 4. Transmissions (social embed strip)
- Label "■ TRANSMISSIONS — X / IG / TIKTOK / LINKEDIN" in yellow; padding 20px 32px 28px; bottom border 1.5px solid.
- 4-column grid, gap 14px, `align-items: start`; one card per platform.
- Card: 1px solid border at 40% foreground, padding 10px, 9px mono platform label on top, then the **real platform embed** where the reference shows a dashed 16:9 placeholder.
- Implementation: official embeds — X (`platform.twitter.com/widgets.js` blockquote, `data-theme="dark"`), Instagram (`www.instagram.com/embed.js`), TikTok (`www.tiktok.com/embed.js`), LinkedIn (post iframe embed). Load scripts lazily (in view). Post URLs come from a static config array per platform so they're easy to swap. Heights will vary — top-align.

### 5. Title-block footer
- 4-column grid, 1px column dividers at 40% foreground.
- Cells: label (9px, 50% opacity) over value (9px): DRAWN BY / B. FLOSZ · STUDIO / FLZ WORKS · DATE / 2026 · CONTACT / FLOSZBENI@GMAIL.COM ↗ (yellow, `mailto:floszbeni@gmail.com`).

## Interactions & Behavior
- Nav + keyboard shortcuts (F/A/S/C) smooth-scroll to sections; active section highlighted yellow via scroll-spy.
- Filmstrip: native horizontal scroll with snap; optional drag-to-scroll; "SCROLL →" hint fades once the user scrolls.
- Sketchfab: user drag-orbits inside the iframe; overlays must keep `pointer-events: none`.
- Responsive: below ~900px — hero height ~50vh, headline ~32–36px, chips wrap under the headline (stack overlays vertically bottom-left); social grid → 2×2 then 1-col; footer → 2×2. Filmstrip already handles small screens natively.

## State Management
- Scroll-spy state for active nav item.
- Works list from the existing portfolio API (already powers the live site's Works & Log).
- Social embeds: static config (array of post URLs per platform).

## Design Tokens
- Background: `#12284B` (blueprint blue)
- Foreground: `#DCE7F5` (paper white-blue)
- Accent: `#FFD166` (drafting yellow)
- Muted foreground: `rgba(220,231,245,.7)`, `.6`, `.5`
- Borders: strong `1.5px solid #DCE7F5`; light `1px solid rgba(220,231,245,.4)`; dividers `1px dashed rgba(220,231,245,.35)`
- Grid texture: 28×28px, 1px lines at `rgba(220,231,245,.06)`
- Hero overlay scrim: `rgba(18,40,75,.75)` chip backgrounds; headline text-shadow `0 2px 20px rgba(18,40,75,.9)`
- Type: **Space Grotesk** 700 for the display headline; **IBM Plex Mono** 400/500/600 for everything else (Google Fonts / next/font).
- Type scale: 9px captions/footer, 10px labels (letter-spacing .12–.2em, uppercase), 11px nav/logo; display 56px.
- Radius: 0 everywhere; no shadows except the hero headline text-shadow.

## Assets
- Project imagery from the existing site API: `https://www.flz.works/api/portfolio/media/...?w=640`.
- Sketchfab model: Pentagon Athaan 2026, id `cbb1b3572d0545f8a8fdbdb09836ebd6`.
- Fonts: Space Grotesk + IBM Plex Mono.

## Files
- `design-reference-3c.html` — full-page HTML reference of the 3c design (open in a browser).
