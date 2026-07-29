# Project: FLZ Portfolio Surface Audit & Alignment

## Architecture
- Framework: Next.js (App Router)
- Portfolio surface routes: `/` (`src/components/lucid-landing.tsx`, `src/app/page.tsx`, `src/app/layout.tsx`), `/studio`, `/id`, `/autosalon`, `/autosalon-new`
- Styling: `src/app/globals.css`, Tailwind CSS, Liquid-Glass system
- Intranet / Autopiac surface: `src/app/intranet/*`, `src/app/autopiac/*` (ISOLATED — DO NOT MODIFY)
- Profile Data Source: `C:\Ai_source\FLZ_profil\PROFILE.md`

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration & Gap Analysis | Inspect PROFILE.md and portfolio routes (`/`, `/studio`, `/id`, `/autosalon`, `/autosalon-new`), style injections, contrast, metadata, noscript, sitemap | none | DONE |
| 2 | Portfolio Content & PROFILE.md Alignment | Fix mailer recipient (`floszbeni@gmail.com`), update personal info, BGE studies, education timeline, experience, tech stack, and eliminate intranet/automotive leaks | M1 | DONE |
| 3 | Design System & Liquid-Glass Tightening | Remove StyleInjector/CSS_KEYFRAMES into globals.css, normalise glass border-radii (12/16/24/999px), WCAG AA contrast (≥4.5:1), letter-spacing, reduced motion, viewport overflow fixes | M1 | DONE |
| 4 | Cross-Route Consistency & Metadata | Create `robots.ts` and `sitemap.ts`, clean root metadata, add `noindex` to intranet & draft routes, add OpenGraph/Twitter cards to subpages, upgrade `<noscript>` | M2, M3 | DONE |
| 5 | Deliverables & Final ESLint Build Fix | Fix all ESLint / JSX comment errors and build failures, generate `AUDIT_FINDINGS.md`, verify `npm run build` succeeds cleanly with exit code 0 | M4 | DONE |

## Interface & Quality Contracts
- Portfolio surface components must strictly source truth from `PROFILE.md`.
- No inline style injections causing FOUC. Keyframe animations must be in `globals.css` with `@media (prefers-reduced-motion: reduce)` fallbacks.
- Glass panel border radii must adhere to standard tokens (12px, 16px, 24px, 999px).
- All normal text contrast must satisfy WCAG 2.1 AA (≥ 4.5:1).
- Intranet / autopiac marketplace features must remain completely untouched.
