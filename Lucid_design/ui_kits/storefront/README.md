# Storefront UI kit

A three-view glass commerce shell: **Shop** (filterable product grid) → **Product** (spec header, hero shot, price slider, add to cart) → **Bag** (line items, total, checkout). A dark glass drop ticker is pinned at the bottom of every view.

Open `index.html`. State is local React state; the bag is interactive.

## Files
- `Parts.jsx` — kit-local bits: `Shot` (imagery placeholder), `Wordmark`, `Spec` (mono label + lines).
- `Storefront.jsx` — `Chrome`, `Shop`, `Product`, `Cart`, `Ticker`, and the `Storefront` root.

## Conventions
Kit screens are **classic scripts**, not ES modules: they read primitives off `window.DS` and register themselves on `window.Kit` so `index.html` can load them with `<script type="text/babel" src="…">`. Don't add `import`/`export` to these files.

## What's faked
All product imagery is a striped placeholder with a mono caption — the system ships no photography. Drop real shots into `Shot` when they exist.
