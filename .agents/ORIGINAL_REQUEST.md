# Original User Request

## Initial Request — 2026-06-29T10:57:56Z

Redesign the live portfolio website to be a 1:1 implementation of the approved design mockup draft (redesign-mockup.html).

Working directory: c:\Users\7bflo\OneDrive\Dokumentumok\used car marketplace
Integrity mode: development

## Requirements

### R1. 1:1 Visual Alignment & Layout
Implement all remaining design elements from [redesign-mockup.html](file:///C:/Users/7bflo/.gemini/antigravity/brain/a7266465-1f24-4c87-b940-f8080640ee04/redesign-mockup.html) that are not yet fully implemented on the live site.
- Switch the primary sans-serif font from `Geist` to `Inter` (import via `next/font/google` in `layout.tsx` to match the mockup 1:1).
- Remove all legacy cyan/purple/neon background blobs, glow effects, and colorful gradients. Make the page 100% cold monochrome slate/black/white.
- Add the animated film grain noise effect globally across the entire site (applied to all pages, including admin/dashboard views).
- Maintain the 3D parallax background functionality exactly as it is, ensuring it remains fully operational.

### R2. Core Theme Styling
Ensure all components (buttons, links, borders, cards, and text) strictly adhere to the cold monochrome palette (pure black backgrounds, ice white typography, slate borders).

## Verification Plan

### Automated Tests
- Run `npm run typecheck` to verify TypeScript compilation.
- Run `npm run build` to verify the production build succeeds.

### Manual Verification
- Verify that `globals.css` contains the global film grain noise effect (`body::after` with keyframes).
- Verify that `layout.tsx` imports `Inter` and uses its variable.
- Verify that all background blobs or inline color styles have been removed from `portfolio-onepager.tsx`.

## Acceptance Criteria

### Visual Fidelity
- [ ] Animated film grain noise is active globally across all pages.
- [ ] The font family for all sans-serif text is `Inter`.
- [ ] No cyan, purple, or other color accents/glows remain in the CSS or on the rendered pages.
- [ ] Visual margins, padding, and layout spacing match the mockup precisely.
- [ ] The 3D parallax background remains fully functional.
