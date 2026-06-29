# Design Redesign Analysis: Live Site vs. Approved Mockup

This report analyzes the differences between the current live portfolio website and the approved design mockup draft (`redesign-mockup.html`), providing precise technical recommendations to achieve a 1:1 match.

---

## Executive Summary
The transition from the current site to the new design requires a shift from a colorful, glassmorphic, multi-themed layout to a **100% cold monochrome, high-precision dark aesthetic**. Key changes include:
1. Switching the primary sans-serif font to **Inter**.
2. Implementing a global **animated film grain noise overlay** at `z-index: 9999`.
3. Stripping all color-palette variables, ambient glowing blobs, and color-mix gradients.
4. Redesigning the layout of the homepage, introducing a floating pill nav, a prominent Hero section with a wireframe car aesthetic, 2-column narrative sections with schematic SVGs, a true CSS masonry grid (columns: 3) with mouse-tracking shimmer refraction, a redesigned footer, and a bottom proposal preview bar.
5. Ensuring the existing high-fidelity 3D WebP parallax background is preserved and layered beneath the new hero elements.

---

## Detailed Requirements Analysis

### 1. Font Switch: Geist to Inter
**Target File**: `src/app/layout.tsx` and `src/app/globals.css`

*   **Current State (`layout.tsx`)**:
    *   Imports `Geist` and `Geist_Mono` from `next/font/google`.
    *   Configures `geistSans` with variable `--font-geist-sans`.
    *   Applies `${geistSans.variable}` to the `<html>` tag.
*   **Current State (`globals.css`)**:
    *   Maps `--font-sans` to `var(--font-geist-sans)` under `@theme inline`.
*   **Redesign Plan**:
    1. In `layout.tsx`, replace the `Geist` import with `Inter`:
       ```typescript
       import { Inter, Geist_Mono, Cormorant_Garamond } from "next/font/google";
       ```
    2. Instantiate the `Inter` font:
       ```typescript
       const inter = Inter({
         variable: "--font-inter",
         subsets: ["latin"],
       });
       ```
    3. Update the `<html>` className in `layout.tsx` to include `${inter.variable}` instead of `${geistSans.variable}`:
       ```typescript
       className={`${inter.variable} ${geistMono.variable} ${cormorantGaramond.variable} h-full antialiased`}
       ```
    4. In `globals.css` (around line 105), update the `@theme inline` block to map `--font-sans` to the new variable:
       ```css
       @theme inline {
         --font-sans: var(--font-inter);
       }
       ```
    *Note: To fully match the mockup, it is also recommended to import `JetBrains_Mono` from `next/font/google` and map it to `--font-mono` / `var(--font-mono)` to replace the default `Geist_Mono`.*

---

### 2. Global Animated Film Grain Noise Effect
**Target File**: `src/app/globals.css`

*   **Current State**:
    *   `body::after` (lines 131-140) is used to render a subtle ambient colored gradient overlay:
        ```css
        body::after {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          content: "";
          background:
            linear-gradient(90deg, var(--ambient-a), transparent 28%, var(--ambient-b) 72%, transparent),
            linear-gradient(180deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0));
        }
        ```
*   **Redesign Plan**:
    1. Replace `body::after` completely with the mockup's high-overlay grain selector:
       ```css
       body::after {
         content: "";
         position: fixed;
         inset: 0;
         z-index: 9999;
         pointer-events: none;
         opacity: 0.035;
         background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
         animation: grain 0.9s steps(4) infinite;
       }
       ```
    2. Append the `@keyframes grain` definition at the bottom of the file:
       ```css
       @keyframes grain {
         0% { background-position: 0 0; }
         25% { background-position: -12px 8px; }
         50% { background-position: 20px -12px; }
         75% { background-position: -8px 20px; }
         100% { background-position: 0 0; }
       }
       ```
    This places the grain overlay on top of all interactive elements (`z-index: 9999`) but keeps it non-blocking using `pointer-events: none`.

---

### 3. Stripping Colorful Gradients, Glows, and Blobs
**Target File**: `src/app/globals.css`

To achieve a 100% cold monochrome slate/black/white design, the following blocks must be **removed** or **neutralized**:

| Code Block / Selector | Lines | Action / Change |
| --- | --- | --- |
| Theme Palettes (`html[data-theme-palette="violet"]`, `graphite`, `amber`) | 31–92 | **Remove entirely**. The site will only use the dark monochrome base. |
| `:root` Accent Variables (`--accent-aqua`, `--accent-mint`, `--accent-rose`, `--accent-amber`) | 11–15 | **Remove**. Replace with monochrome token: `--accent: #ffffff`. |
| `:root` Background Gradients (`--page-gradient-a` to `d`, `--page-base-a` to `c`) | 16–22 | **Remove**. Replace with `--ink: #000000`, `--ink-2: #080808`, `--ink-3: #111111`. |
| `:root` Ambient Glows (`--ambient-a`, `--ambient-b`) | 23–24 | **Remove**. |
| `:root` Liquid Primary Gradients (`--liquid-primary`, `--liquid-primary-shadow`) | 25–26 | **Remove**. |
| `body` Background Gradient | 111–113 | Change to `background: var(--ink);` |
| `.glass-surface::before` & `.glass-panel::before` | 198-208, 227-235 | Remove the colorful `linear-gradient(270deg, ...)` containing aqua, rose, and amber. |
| `.liquid-button-primary` & `.liquid-button-secondary` | 252–277 | Remove or replace with monochrome `.hero-btn-primary` and `.hero-btn-ghost`. |
| `.theme-active-pill` | 279–283 | Remove. |
| Liquid Blobs (`@keyframes blob-pivot-1` to `3` & `.animate-blob-1` to `3`) | 362–390 | **Remove entirely**. These are the colored animated background blobs. |
| `.portfolio-shell` Background | 393 | Change `background: #020205;` to `background: var(--ink);` |
| `.portfolio-bento-hero`, `.portfolio-bento-card`, `.portfolio-archive-card` | 446–563 | Remove navy/blue tints from gradients. Change background to `var(--ink-3)` or a semi-transparent dark slate. |
| `.portfolio-section-title` Gradient | 567 | Remove `linear-gradient` text fill. Set to solid white or `var(--text-primary)`. |
| `.portfolio-text-glow` | 574–581 | Remove text-shadow glow. |
| `.portfolio-filter-cyan` & `.portfolio-filter-purple` | 614–627 | Remove entirely. Active filters should use monochrome styling: `background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.18);`. |
| `.ap3d-shell` (Intranet Scoped Styles) | 807–1443 | Neutralize background gradients and remove colored glow highlights (`var(--accent-aqua)`, `var(--accent-rose)`, etc.) to ensure the entire site is monochrome. |

---

### 4. Redesigning Portfolio Components
**Target File**: `src/components/portfolio-onepager.tsx`

To match the mockup 1:1, the React components must be refactored as follows:

#### A. Navigation Bar (Floating Pill Nav)
*   **Current**: Full-width fixed header with a bottom border and a scroll progress indicator.
*   **Redesign**:
    *   Change the `<header>` to a floating, centered `<nav className="nav">` matching the mockup.
    *   Apply the styles: `fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-[2px] p-[6px] bg-[#080808]/70 border border-white/7 rounded-full backdrop-blur-3xl shadow-xl`.
    *   Include a left-aligned `<span className="nav-logo font-serif text-[15px] font-semibold tracking-wider pr-4 border-r border-white/7 mr-1">FLZ</span>`.
    *   Render navigation links with JetBrains Mono (`font-mono text-[10px] tracking-widest uppercase text-white/45 hover:text-white hover:bg-white/6 px-3 py-1.5 rounded-full transition-all`).

#### B. Hero Section
*   **Current**: No Hero section exists in the onepager component; it goes straight from the background to the ticker.
*   **Redesign**: Add a full-screen `<section className="hero h-screen min-h-[700px] relative flex flex-col justify-end overflow-hidden">` at the top of the page.
    *   **Background wireframe**: Add the SVG car silhouette in the center of the hero stage with an opacity of `0.06`.
    *   **Depth elements**: Add floating text/line divs that respond to mouse movements (integrated with the parallax script):
        *   `3D Auto Design` (right side, vertical text).
        *   `MIRSAIREN 2026` (right side).
        *   Floating vertical line (left side).
        *   Floating wireframe circle (left side).
    *   **Hero Content**:
        *   Eyebrow: `Portfolio — Design & Engineering · 2026` (with a leading horizontal line).
        *   Wordmark: A two-line text block:
            *   Line 1: `FLZ` (outlined serif: `-webkit-text-stroke: 1px rgba(255,255,255,0.15); color: transparent;`).
            *   Line 2: `Works` (solid white with a soft breathing glow).
        *   Tagline & Stats: A flex container containing the italic serif tagline on the left, and a three-column stat counter (`12 Projects`, `5+ Years`, `∞ Precision`) on the right.
        *   CTA Buttons: "View Archive" (solid white button) and "Scroll to Explore" (ghost button) alongside a `↓ scroll to begin` indicator.
    *   **Scroll Dot Indicator**: A vertical track of dots on the right side indicating current scroll depth.

#### C. Running Ticker
*   **Current**: Uses standard `animate-marquee` with arbitrary text.
*   **Redesign**: Wrap the ticker in a `.ticker-wrap` container (border-t/b, background overlay) and apply `.ticker-inner` with `animate-ticker-scroll` (or equivalent Tailwind animation). Ensure items are styled in JetBrains Mono, 9px, uppercase, separated by a centered dot.

#### D. Narrative Sections (Process & Interface)
*   **Current**: Simple centered text blocks.
*   **Redesign**: Refactor both sections into 2-column layouts (`grid grid-cols-1 md:grid-cols-2 gap-20 items-center max-w-7xl mx-auto py-40 px-8 md:px-20`):
    1.  **Process Section**:
        *   Left: A visual container containing the custom SVG schematic (concentric circles, crosshairs, and text `DESIGN SYSTEM` / `PRECISION ENGINEERING`).
        *   Right: Narrative text including the label `// 01 — Process`, title `Where precision meets craft.`, body text, and a hover-animated arrow link `Explore the process`.
    2.  **Interface Section**:
        *   Left: Narrative text including the label `// 03 — Interface`, title `Systems built to feel.`, body text, and an arrow link `See the design system`.
        *   Right: A visual container containing the custom SVG wireframe dashboard schematic (`INTERFACE ARCHITECTURE`).
        *   *Note: Use the `.reverse` flex/grid direction (or swap DOM order) to place the text on the left and the graphic on the right.*

#### E. Selected Works Masonry Grid
*   **Current**: Standard grid layout with uniform cards.
*   **Redesign**:
    *   Use CSS columns: `columns-1 sm:columns-2 lg:columns-3 gap-6` on the grid container.
    *   Ensure cards have `break-inside: avoid mb-6` to prevent splitting.
    *   Introduce varied aspect ratios on the card image wrappers:
        *   `aspect-[3/4]` (Tall) for cards 1 & 5.
        *   `aspect-[16/9]` (Wide) for cards 2 & 4.
        *   `aspect-[1/1]` (Square) for cards 3 & 6.
    *   **Hover Shimmer Refraction**:
        *   Add a mouse move handler (`onMouseMove`) to the card elements that calculates client coordinates relative to the card bounds and updates CSS variables:
            ```typescript
            const rect = e.currentTarget.getBoundingClientRect();
            e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
            e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
            ```
        *   In CSS, apply a radial gradient overlay that follows the mouse:
            ```css
            .masonry-card::before {
              content: "";
              position: absolute;
              inset: 0;
              z-index: 5;
              background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.04), transparent 50%);
              opacity: 0;
              transition: opacity 0.3s ease;
              pointer-events: none;
            }
            .masonry-card:hover::before { opacity: 1; }
            ```
    *   **Hover Overlay Details**: Translate and fade in the project title and category meta information from the bottom of the card on hover.

#### F. Identity Strip & Footer
*   **Current**: Basic footer and bio.
*   **Redesign**:
    *   **Identity Strip**: Refactor to match the mockup's layout, ensuring the skill tags have the `.identity-skill` class and hover border effects.
    *   **Footer**: Replace the current ticker footer with a three-column layout:
        *   Col 1: Wordmark `FLZ` and metadata `Design & Engineering · 2026`.
        *   Col 2: Quick links (`Archive`, `Process`, `Contact`, `Instagram`).
        *   Col 3: Core studio capabilities text block in JetBrains Mono.

#### G. Proposal Bar
*   **Current**: None.
*   **Redesign**: Add a fixed bar at the bottom:
    ```html
    <div className="proposal-bar fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#080808]/85 border border-white/12 rounded-full px-5 py-2.5 backdrop-blur-2xl flex items-center gap-[14px] shadow-2xl">
      <div className="proposal-dot w-[5px] height-[5px] rounded-full bg-white/30 animate-pulse" />
      <span className="font-mono text-[9px] tracking-wider uppercase text-white/50">Design Preview</span>
      <div className="w-px h-3 bg-white/10" />
      <span className="font-mono text-[9px] tracking-wider uppercase text-white/85">FLZ Works — New Structure</span>
    </div>
    ```

---

### 5. Integration and Preservation of the 3D Parallax Background
**Target File**: `src/components/landing-parallax.tsx`

The existing 3D Parallax Background is a highly advanced component that renders layered WebP images and virtual depth layers. This must be **fully preserved** as it represents the core interactive visual of the site.

**Integration Strategy**:
1. Keep the `<LandingParallax />` component call at the very top of `portfolio-onepager.tsx`.
2. Ensure the `<LandingParallax />` container has `position: fixed; inset: 0; z-index: 0;`.
3. The new `<section className="hero">` must have `position: relative; z-index: 10; background: transparent;`. This guarantees that the 3D parallax layers are visible behind the hero text, buttons, and wireframe SVG.
4. The scroll-based blur and darkening overlay in `landing-parallax.tsx` (which triggers when `window.scrollY > 120`) is fully compatible with the new content and will automatically fade/blur the background as the user scrolls down into the Ticker and Narrative sections.
