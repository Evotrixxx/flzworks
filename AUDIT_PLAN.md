# FLZ Portfolio Site — Design, Alignment & Profile-Fidelity Audit Plan

> **Purpose.** Brief for a follow-up AI agent. This document scopes a full pass over the portfolio surface of the `autopiac` Next.js codebase to (a) find and fix design + alignment issues, (b) verify the site accurately represents `C:\Ai_source\FLZ_profil\PROFILE.md` as a professional portfolio, and (c) tighten visual alignment with the attached glassmorphism dashboard reference.
>
> **Do not touch the `intranet/autopiac` app.** That is the used-car marketplace and is out of scope. This audit is portfolio surface only.

---

## 0. Preflight — read these first

| # | Path | Why |
|---|---|---|
| 1 | `C:\Ai_source\FLZ_profil\PROFILE.md` | Ground truth for who the site represents. All portfolio copy must be consistent with this. |
| 2 | `C:\Ai_source\FLZ_profil\AI_CONTEXT.md` | Structured `<developer_profile>` block — canonical spellings, dates, tech stack. |
| 3 | `G:\Saját meghajtó\used car marketplace\src\app\layout.tsx` | Root layout, fonts, theme boot script, noscript fallback. |
| 4 | `G:\Saját meghajtó\used car marketplace\src\app\page.tsx` | Home route → renders `LucidLanding`. |
| 5 | `G:\Saját meghajtó\used car marketplace\src\app\globals.css` | Design tokens: Lucid warm-neutral liquid-glass system + fallback dark tokens. |
| 6 | `G:\Saját meghajtó\used car marketplace\src\components\lucid-landing.tsx` | Primary landing UI + Lucid design-system CSS. |
| 7 | `G:\Saját meghajtó\used car marketplace\src\components\portfolio-onepager.tsx` | Alt one-pager portfolio surface. |
| 8 | `G:\Saját meghajtó\used car marketplace\src\components\portfolio-blueprint.tsx` | Blueprint/landscape portfolio variant. |
| 9 | `G:\Saját meghajtó\used car marketplace\src\components\landing-parallax.tsx` | Parallax landing variant. |
| 10 | `G:\Saját meghajtó\used car marketplace\src\app\uidesign\*` | Design-system showcase routes (`control-center`, `dynamic-island`, `liquid-glass`, `lucent-ui`, `widget-space`). These are the closest existing references to the attached mockup — mine them for reusable patterns before writing anything new. |
| 11 | `G:\Saját meghajtó\used car marketplace\src\app\studio\page.tsx`, `src\app\id\page.tsx`, `src\app\autosalon\page.tsx`, `src\app\autosalon-new\page.tsx` | Secondary portfolio-adjacent routes to audit for consistency. |

> ⚠️ **Next.js version note.** `CLAUDE.md` at the repo root explicitly warns: *"This is NOT the Next.js you know."* Before editing routing, layouts, dynamic segments, `metadata`, `use client`, or Server Components, read `node_modules/next/dist/docs/` for the relevant page. Do not apply pre-App-Router or pre-16.x conventions from memory.

---

## 1. Visual reference — the attached glassmorphism dashboard

The reference image shows a **dark liquid-glass dashboard** with:

- Full-bleed dark ambient background (warm-neutral, slight room bokeh).
- Rounded outer shell (radius ≈ 24 px) floating on the background with a soft blurred edge.
- **Pill-shaped top nav** in the center, single selected pill in cream/white, siblings in low-opacity dark glass.
- Large numeric stat cards to the right of the hero headline (mono/geometric numerals, thin unit subscripts).
- **Chip filter row** ("All / Salary / Taxes / Software …") — same pill treatment.
- Inner **glass panels with 12–20 px radius**, thin 1 px stroke at ~7–12 % white, subtle inner shadow.
- Right-hand **stacked feature cards** (200 / 2999) with an accent pill card and a bright cream card.
- Avatar cluster on a horizontal rail with a "+" affordance.
- **Typography:** display serif or wide-tracking sans for headings; monospaced or condensed sans for labels and stats; ALL CAPS microlabels with wide letter-spacing.
- Palette: warm cream (`#FAF6F0` range) on ink (`#14120F` range) — this matches the existing `--lucid-*` tokens in `globals.css`.

**Alignment target.** The FLZ portfolio's existing Lucid design system is already close to this reference. The audit should *lean into* the existing tokens rather than re-theming. Anywhere the site diverges from the reference (harder edges, cool greys, tight radii, missing pill nav, mis-tracked labels), align it back.

---

## 2. Profile fidelity — what MUST be represented

Every claim below is drawn from `PROFILE.md`. Verify each appears somewhere on the portfolio surface (landing, `/studio`, `/id`, or a dedicated section), spelled and dated identically. Flag anywhere the site is silent, contradictory, or stale.

**Identity**
- Name: `Flosz Bence Norbert` (Latin order acceptable in EN copy: `Bence Flosz`).
- Roles: `Business Informatics Student (BGE)` · `Indie Game Developer / Studio Founder` · `Backend Developer`.
- Location: `Budapest, Hungary`.

**Contact & links**
- Email: `floszbeni@gmail.com` — **NOTE:** `layout.tsx` currently uses `7bfloszb@gmail.com` in the userEmail context; confirm which is public.
- Phone: `+36 20 628 2353` — decide whether to display publicly.
- LinkedIn: `linkedin.com/in/bence-flosz-56134535a`.
- GitHub: `github.com/Flzvision`.

**Flagship project**
- Title: `4-Player Co-op Liminal Game`.
- Genre: co-op multiplayer ("friendslop"), level-structured, story-assisted.
- Aesthetic: `liminal / dreamcore`.
- Stack: `Godot Engine (3D, C#)`, `Blender`, `Photoshop`.
- Focus: multiplayer sync, lobby systems, level management, gameplay architecture.

**Tech stack (must be reachable in ≤ 1 click from landing)**
- Game Dev: Godot (C# multiplayer + lobby), Roblox Studio, Blender, Photoshop.
- Backend / Web: PHP, JavaScript, SQL (query optimisation), HTML5, CSS3, Bootstrap 5.
- AI & Automation: Ollama, PowerShell, Python (basics).
- Business: BGE Business Informatics, monetisation & Steam release strategy, community growth.
- Languages: Hungarian (native), English (B2 Complex).

**Experience timeline**
- 2024 summer – present · Independent Game Developer (self).
- 2024.12 – 2025.02 · Boredo Systems Kft. · Backend Web Developer.
- 2023 – 2024 · Freelance Branding & Prototyping.

**Education**
- 2025 – present · BGE · Business Informatics BSc.
- 2023 – 2024 · Pázmány Péter Katolikus Egyetem · Mérnökinformatikus.
- 2021 – 2023 · Schola Europa Akadémia · Software Developer & Tester.
- 2017 – 2021 · Óbudai Gimnázium · Érettségi.

---

## 3. Audit checklist — design & alignment

Run in this order. For every ❌, produce a diff. Skip nothing.

### 3.1 Layout & grid
- [ ] Landing hero uses the intended 2-column grid (`lucid-hero-grid`); at `≤ 860 px` collapses cleanly.
- [ ] `lucid-body-grid` sidebar (236 px) does not overflow on 1280 px viewports; verify no horizontal scroll at 320 / 375 / 768 / 1024 / 1280 / 1440 / 1920.
- [ ] Stat cards align to a shared baseline. Numeric glyphs share the same tabular font-feature so digits don't wobble across cards.
- [ ] Chip filter row wraps to a second line before overflowing; wrap gap = row gap.
- [ ] All glass panels share one radius scale (recommend 12 / 16 / 20 / 24). Enumerate any one-off radii and consolidate.
- [ ] Nothing sits inside 12 px of a viewport edge on mobile.

### 3.2 Typography
- [ ] Confirm the six loaded fonts (`Inter`, `JetBrains_Mono`, `Cormorant_Garamond`, `Space_Grotesk`, `IBM_Plex_Mono`, `Archivo`) are each actually used. Remove any that are loaded-but-unreferenced — every unused family costs a network round-trip.
- [ ] Uppercase mono labels use `letter-spacing: 0.12–0.13em` consistently. Search for stray `letter-spacing` values and normalise.
- [ ] Body copy hits WCAG AA on the dark warm background (contrast ratio ≥ 4.5:1 for text < 18 px, ≥ 3:1 for ≥ 18 px). Flag `rgba(250,246,240,0.45)` etc.
- [ ] Hungarian diacritics (`őűáéíóúöü`) render correctly in headings — verify the display face supports them.

### 3.3 Color & tokens
- [ ] The fallback `:root` block (lines ~28-70 of `globals.css`) uses greyscale (`#ffffff`, `#cccccc`, `#888888`, `#aaaaaa`) for accent tokens. Reconcile with the Lucid warm palette — either delete the fallback block or map the tokens to warm equivalents. Right now two disconnected token systems live side-by-side.
- [ ] Verify the `[data-theme-palette]` and `[data-glass]` variants set by the boot script in `layout.tsx` are actually consumed by CSS. If not, either wire them up or remove the script.
- [ ] Any hardcoded hex outside the token layer? Grep for `#[0-9a-fA-F]{3,8}` inside `src/**/*.tsx` and normalise.

### 3.4 Component polish
- [ ] `LucidLanding` icon glyphs (`GithubIcon`, `LinkedInIcon`, `MailIcon`, etc.) are visually centered inside their 30 px / 44 px targets. On coarse pointer, targets grow to 44 px — verify the icon inside is not left-anchored.
- [ ] `.lucid-cta-primary` / `.lucid-cta-dark` share an alignment baseline and their shadow directions match.
- [ ] Focus states: every interactive element has a visible focus ring using `--focus-ring`. Tab through the landing and log any element that receives focus with no outline.
- [ ] Reduced motion: wrap the `lucid-shell-in`, `lucid-fade-up`, `lucid-shimmer`, `lucid-pulse-dot` keyframes in `@media (prefers-reduced-motion: reduce) { … animation: none }`.
- [ ] `StyleInjector` in `lucid-landing.tsx` writes a `<style>` at runtime. This causes a FOUC before hydration. Move `CSS_KEYFRAMES` into `globals.css` (or a dedicated `lucid.css` imported by the layout) and delete `StyleInjector`.

### 3.5 Content fidelity vs. PROFILE.md
- [ ] Landing headline names Bence and one primary role (game dev). If it says something generic ("Portfolio"), rewrite.
- [ ] Flagship project card exists above the fold and links to a project detail (or Instagram / GitHub if no dedicated page).
- [ ] Skill list matches the four categories in `PROFILE.md § Tech Stack`. Do not silently drop any listed skill.
- [ ] Experience section lists all three roles in reverse-chronological order with the exact date ranges from `PROFILE.md`.
- [ ] Education section lists all four institutions.
- [ ] Contact block shows GitHub + LinkedIn + email. If phone is present, confirm the user actually wants it public.
- [ ] `metadata.description` in `src/app/page.tsx` and `src/app/layout.tsx` are consistent with each other and with `PROFILE.md`. Current `layout.tsx` description ("Portfolio and private AutoPiac intranet by FLZ") mixes personal + product — split them.
- [ ] `<noscript>` fallback in `layout.tsx` currently says *"Photorealistic 3D automotive design…"* — that is autopiac copy, not FLZ. Replace with a portfolio-appropriate fallback pulled from `PROFILE.md`.

### 3.6 Accessibility (WCAG 2.1 AA quick pass)
- [ ] All `<Image>` uses have meaningful `alt`. Decorative ones use `alt=""` explicitly.
- [ ] Every `<button>` and icon-only link has an `aria-label`.
- [ ] Landing headline is a single `<h1>`. Section headings step by one (`h2` → `h3`), never skip.
- [ ] Dialog / namecard trap focus and restore on close.
- [ ] Scroll-behavior: smooth is respected only when `prefers-reduced-motion: no-preference` (currently unconditional in `globals.css`).

### 3.7 Cross-route consistency
- [ ] `/`, `/studio`, `/id`, `/autosalon`, `/autosalon-new` all share the same header, footer, and font stack. Any route that hand-rolls its own is a lint target.
- [ ] Language switcher works on every portfolio route. Confirm HU + EN copy exists for every user-facing string on the landing.
- [ ] `robots` / sitemap: confirm portfolio routes are indexable and intranet routes are not.

---

## 4. Deliverables

The follow-up agent produces:

1. **`AUDIT_FINDINGS.md`** at the repo root — one section per checklist heading, with severity (`P0` blocker, `P1` polish, `P2` nice-to-have) and file + line references.
2. **A single PR** implementing all P0 and P1 fixes. Use conventional commit messages. Do NOT bundle intranet changes.
3. **Screenshots** at 375 / 768 / 1440 of `/`, `/studio`, `/id` — before and after — attached to the PR.
4. **Updated `metadata` blocks** so social preview cards use the corrected PROFILE-consistent description.

---

## 5. Out of scope

- The used-car marketplace (`src/app/intranet/autopiac/**`, all `/cars`, `/sell`, `/favorites`, `/saved-searches`, `/dashboard`, `/login`, `/register`).
- Prisma schema, API routes, database migrations.
- Adding new content that isn't in `PROFILE.md` — this is an alignment audit, not a rewrite.

---

## 6. Acceptance

Ship when:
- Every P0 checkbox above is ticked.
- `AUDIT_FINDINGS.md` exists with a summary count of issues found / fixed / deferred.
- `npm run lint` and `npm run typecheck` pass.
- `npm run test` (vitest) passes; add a test if you touch `portfolio-verification.test.ts` scope.
- A human confirms the landing at 1440 px matches the reference glassmorphism dashboard aesthetic (pill nav, warm cream on ink, matching radii, aligned stat cards).
