# Console UI kit

A smoked-glass application shell over a warm interior backdrop: floating icon rail, pill nav, and three views.

- **Overview** — headline + four big-number metrics, a run ring, a subscription module with per-item approve/skip, and two side tiles (one dark glass, one opaque cream for contrast).
- **Automation** — a three-panel builder: day picker + monthly cap slider, plan tiers, payment source with a bar-style selector.
- **Settings** — workspace form on glass, rule switches, team access on an opaque card.

Open `index.html`; all state is local and interactive.

## Conventions
Screens are classic scripts registering on `window.Kit` (see `../storefront/README.md`). Everything visual comes from `window.DS` primitives — the kit adds only layout and copy.

## What's faked
Vendor logos and portraits are flat accent-colour squares/initials; no third-party marks are reproduced. Numbers are illustrative.
