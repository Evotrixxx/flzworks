# Lucid — a liquid-glass design system

Lucid is a **glass-first interface system**: warm neutral, near-monochrome, built from translucent blurred surfaces that float over photography or gradient backdrops. Every control is a capsule; every metric is a big display numeral over a tiny mono label. It is designed for two kinds of product surface:

1. **Storefront** — an editorial commerce shell (product grid → detail → bag).
2. **Console** — a smoked-glass data application (metrics, automation builder, settings).

## Sources

The system was derived from four liquid-glass reference images supplied by the user (`uploads/LiqGlass.jpg`, `LiqGlass2.jpg`, `LiqGlass3.jpg`, `LiqGlass4.jpg` — also mirrored in `references/`). **No codebase, Figma file or brand kit was provided**, so:

- Colours, type, radii and glass recipes are *reconstructed by eye* from the references and expressed as tokens — they are not extracted values from a real product.
- Fonts are Google substitutions: **Archivo** for display/UI (the references use a tight geometric grotesk) and **IBM Plex Mono** for labels. Supply real font binaries and we will swap them in.
- The references show third-party brands and product photography; none of that is reproduced here. Product names, "Lucid" itself, and all numbers are invented placeholders.
- **There is no logo.** The mark is the word LUCID set in Archivo 800 inside an ink capsule (see `guidelines/brand-wordmark.card.html`). Nothing was drawn or recalled.

## Content fundamentals

- **Voice:** flat, specification-like, confident. The interface states facts; it does not sell or explain. "Add to cart", "Activate", "Pay from", "Monthly on the 12th".
- **Casing:** three registers, used strictly. Display headlines in **Sentence case** ("Automatic Payment", "New · Cosmic Set 23"). Buttons in **Sentence case**. Metadata, kickers and utility actions in **UPPERCASE MONO** with wide tracking ("CLASSIC HOODIE / BY LUCID STUDIO", "REFRESH").
- **Person:** neither *I* nor *you* in chrome — the UI is impersonal ("Payment method", not "Your payment method"). *You* appears only where ownership matters ("Your bag").
- **Length:** labels ≤ 4 words. Body copy ≤ 2 lines. Numbers do the talking; units are superscripts (`990,815$`, `18ᵗʰ`, `80%`).
- **Separators:** the middle dot is the system's connective tissue — "New · Cosmic Set 23", "Monthly · 12th", "Dust · Ink · Cream".
- **No emoji.** Ever. Metadata that needs a marker uses a 5px dot inside a Badge.
- **Numerals:** grouped with commas, never abbreviated to "1.2k" in primary metrics.

## Visual foundations

**Palette.** One warm neutral ramp (`--ink-900` → `--cream-25`) carries structure, hierarchy and 95% of the pixels. Two oklch accents at identical chroma and lightness (`--accent-warm` 74°, `--accent-cool` 232°) appear only as focus rings, ring-chart strokes and avatar fills — never as surface fills, never as a gradient. Status colours exist but are used at 22–26% mix so they read as tinted glass, not alerts.

**Backdrops.** Glass is meaningless without something behind it. Every full-screen layout sits on a backdrop: photography in production, or the shipped gradient stand-ins `--backdrop-dusk` (cool sky over warm ground), `--backdrop-interior` (warm room), `--backdrop-studio` (bright soft-box). Backdrops are `background-attachment: fixed` so panels appear to move across them.

**Glass recipe.** Four layers, always in this order: tint (`--glass-light` / `-mid` / `-dark`) → `backdrop-filter: blur() saturate()` (saturation 150–190% is what keeps glass from going grey) → 1px light edge → inner glow + top specular gradient at `mix-blend-mode: screen`. Cast shadows are long, soft and warm-black (`--shadow-md` → `--shadow-float`), never neutral grey. Nest at most two levels of glass.

**Type.** Archivo 700 for display at 0.92–0.98 line-height and −0.03em tracking — headlines are tight, large and left-aligned. Archivo 400/600 for body at 15/13px. IBM Plex Mono uppercase at 9–11px with 0.14–0.18em tracking for every label, spec and caption. The mono/display contrast *is* the typographic identity; there is no third voice.

**Layout.** Detached floating panels with 20–28px gutters, not edge-to-edge chrome. Nav capsules and icon rails hover away from the viewport edge. Content inside panels uses 24px padding and 16px gaps, on a 4px scale (2→72px). Grids are explicit and repeating (4-up product grid, 3-up builder, 7-column date picker).

**Shape.** Pill (`999px`) is the default for anything interactive — buttons, inputs, selects, nav, rails, badges, sliders. Panels use 16/24/32px. Squares appear only as media crops and small colour markers.

**Depth.** Elevation is expressed by shadow length and blur strength together: a floating panel is `blur(54px)` + `--shadow-float`; a nested tile is `blur(8px)` + no shadow.

**Motion.** One expressive curve, `--ease-glass` (`cubic-bezier(.22,1,.36,1)`), for anything that moves or reveals; `--ease-inout` for colour. 140ms hover, 260ms surface, 420ms reveal. Nothing bounces, nothing spins.

**States.** Hover = tint one step stronger (glass) or one step lighter (ink), never a hue change. Press = `scale(0.975)` plus `--shadow-inset-press`. Focus = 3px `--accent-warm` ring outside the pill. Active/selected = the surface flips to opaque cream or ink — the single strongest signal in the system, used once per group.

**Transparency rules.** Transparent surfaces only over backdrops. When a value must be unambiguous (price, total, approve action) the surface goes **opaque** — solid cream or ink. Contrast is bought with opacity, not colour.

**Imagery.** Warm, low-sun, desert/interior tonality; soft focus; product isolated in a glass or bubble volume. This system ships **no photography** — every image slot is a striped placeholder with a mono caption naming what belongs there.

## Iconography

- A built-in set of **16 stroke glyphs** (`components/core/IconButton.jsx`): 1.4px stroke, round caps and joins, 16px box, `currentColor`. Rendered inline as SVG paths, exported as `Glyph`.
- No icon font, no sprite sheet, no PNG icons. Nothing was copied from a third-party set — the references contained no icon library.
- To extend, use **Lucide** (matching stroke feel) from CDN rather than hand-drawing; flag additions here.
- Unicode is used for two things only: the middle dot separator (·) and the registered mark (®) in the wordmark. No emoji.

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | Global entry point — imports every token file. Link this one file. |
| `tokens/` | `fonts`, `colors`, `typography`, `spacing`, `glass`, `motion`, `base`. |
| `components/core/` | GlassPanel, Button, IconButton (+Glyph), Badge, Card |
| `components/forms/` | Input, Select, Switch, Checkbox, Slider |
| `components/navigation/` | NavPills, IconRail, Segmented |
| `components/data/` | StatBlock, ProgressRing, AvatarStack |
| `guidelines/*.card.html` | 18 foundation specimen cards (Colors, Type, Spacing, Glass, Motion, Brand). |
| `ui_kits/storefront/` | Commerce shell — shop, product, bag. |
| `ui_kits/console/` | Payments console — overview, automation, settings. |
| `card-runtime.js` | Resolves the compiled bundle onto `window.DS`; `DSLoad`/`DSMount` helpers for card and kit pages. |
| `references/` | The four supplied liquid-glass reference images. |
| `SKILL.md` | Agent-Skills entry point for using this system elsewhere. |

## Intentional additions

Nothing in this system existed as source code, so the component inventory is the standard set sized to the two kits, plus:

- **GlassPanel** — the substrate primitive. Without it every consumer would re-derive the four-layer glass recipe by hand.
- **StatBlock / ProgressRing** — the references lean heavily on big-number metrics with superscript units; these encode that treatment.

## Caveats

- Fonts are substitutions (see Sources). Real binaries welcome.
- No photography, no logo, no icon library was supplied — all three are placeholders or built-ins.
- `backdrop-filter` is required; in browsers without it, glass panels fall back to flat translucent fills and lose their depth.
