# Handoff Report — Explorer 3

This report outlines the findings, logic, and concrete action steps for implementing the monochrome redesign of the FLZ portfolio website based on the approved mockup draft.

---

## 1. Observation

I have viewed and analyzed the following files:
*   **Current layout**: `src/app/layout.tsx`
*   **Current global styles**: `src/app/globals.css`
*   **Current portfolio component**: `src/components/portfolio-onepager.tsx`
*   **Preserved parallax background**: `src/components/landing-parallax.tsx`
*   **Design mockup**: `C:\Users\7bflo\.gemini\antigravity\brain\a7266465-1f24-4c87-b940-f8080640ee04\redesign-mockup.html`

Key observations:
1.  **Fonts in `layout.tsx` (lines 1-21)**:
    ```typescript
    import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
    const geistSans = Geist({
      variable: "--font-geist-sans",
      subsets: ["latin"],
    });
    ```
2.  **Global Styles in `globals.css`**:
    *   **Monochrome font map (lines 105-106)**:
        ```css
        --font-sans: var(--font-geist-sans);
        --font-mono: var(--font-geist-mono);
        ```
    *   **Body background and glows (lines 109-140)**:
        ```css
        body {
          min-height: 100vh;
          background:
            linear-gradient(115deg, var(--page-gradient-a) 0%, var(--page-gradient-b) 34%, var(--page-gradient-c) 68%, var(--page-gradient-d) 100%),
            linear-gradient(180deg, var(--page-base-a) 0%, var(--page-base-b) 54%, var(--page-base-c) 100%);
          color: var(--foreground);
          background-attachment: fixed;
        }
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
    *   **Animated blobs (lines 362-390)**: Contain keyframes `blob-pivot-1`, `blob-pivot-2`, `blob-pivot-3` and classes `.animate-blob-1`, `2`, `3`.
    *   **Theme palettes (lines 31-92)**: Contain `html[data-theme-palette="violet"]`, `graphite`, `amber`.
3.  **Mockup Grain and Styling in `redesign-mockup.html`**:
    *   **Animated grain (lines 45-62)**:
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
        @keyframes grain {
          0% { background-position: 0 0; }
          25% { background-position: -12px 8px; }
          50% { background-position: 20px -12px; }
          75% { background-position: -8px 20px; }
          100% { background-position: 0 0; }
        }
        ```
4.  **Portfolio Layout in `portfolio-onepager.tsx`**:
    *   Lack of a Hero section; it starts with the ticker bar directly under the header.
    *   CSS grid in selected works: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` (line 232) with fixed aspect ratios `aspect-[4/3]`.
    *   Centered narrative sections rather than 2-column layout with SVGs.
5.  **Parallax Background in `landing-parallax.tsx`**:
    *   Renders with `fixed inset-0 z-0` (line 77) and contains WebP image layers.

---

## 2. Logic Chain

1.  **Font Switching**:
    *   Since the mockup uses Inter (`font-family: 'Inter', sans-serif;` on `body`), we must replace `Geist` with `Inter` in `layout.tsx` and configure it as `--font-inter`.
    *   Updating `globals.css` to map `--font-sans: var(--font-inter)` ensures all elements using the default sans-serif font automatically switch to Inter.
2.  **Grain Effect**:
    *   The mockup's animated grain effect must overlay everything to give the site a unified tactile feel.
    *   Placing it on `body::after` with `z-index: 9999` and `pointer-events: none` ensures it overlays all elements (including images and text) without interfering with user clicks.
3.  **Monochrome Conversion**:
    *   Removing the background gradients, theme palettes, and color-mix values from `globals.css` and setting the body background to `var(--ink)` (black) converts the site to a 100% cold monochrome palette.
    *   Removing the liquid blob keyframes and classes prevents colored elements from rendering.
4.  **Component Redesign**:
    *   The layout of `portfolio-onepager.tsx` must be expanded to include the new Hero section and the bottom proposal bar.
    *   The narrative sections must be split into 2-column grids with the exact inline SVGs from the mockup.
    *   The works grid must be changed to `columns: 3` with variable aspect ratios, and the `onMouseMove` handler must calculate client coordinates to update `--mouse-x` and `--mouse-y` variables for the shimmer refraction effect.
5.  **Parallax Background Integration**:
    *   Because `LandingParallax` is rendered with `fixed inset-0 z-0`, keeping it as the first element in `portfolio-onepager.tsx` and rendering all other content inside containers with `position: relative; z-index: 10; background: transparent;` ensures the 3D parallax layers are visible behind the new hero content and silhouette.

---

## 3. Caveats

*   **Intranet Styles (`.ap3d-shell`)**: The intranet dashboard styles located at the bottom of `globals.css` contain references to colors like `var(--accent-aqua)` and `var(--accent-rose)`. We assume these should also be neutralized to monochrome if they are accessible from the main portfolio, or left as is if the intranet is considered a separate app section.
*   **Media API Paths**: The selected works grid in `portfolio-onepager.tsx` loads images dynamically via `/api/portfolio/media/...`. We must ensure the redesigned masonry grid cards continue to use these dynamic image paths while adopting the new aspect ratios.

---

## 4. Conclusion

The redesign is highly feasible and can be achieved purely by:
1.  Modifying `src/app/layout.tsx` to load Inter instead of Geist.
2.  Modifying `src/app/globals.css` to remove all colored styles/blobs, add the monochrome tokens, and add the global animated grain overlay.
3.  Refactoring `src/components/portfolio-onepager.tsx` to match the structure, SVGs, and interactive elements of the mockup.
4.  Leaving `src/components/landing-parallax.tsx` intact while ensuring the new hero section is layered transparently above it.

---

## 5. Verification Method

1.  **Build and Compile**: Run `npm run build` or `next build` (using `run_command`) to verify that the font import and component refactoring compile without TypeScript or build-time errors.
2.  **Inspect Layout**: Verify that the `html` tag contains the `class` for the Inter font and that the body has the `body::after` selector with the SVG data-uri.
3.  **Inspect DOM**: Verify that the `<LandingParallax />` component is rendered at the root of the page and is layered beneath the transparent `<section className="hero">`.
