# Portfolio Redesign Analysis: Live Site vs. Approved Mockup

This report analyzes the differences between the current live portfolio website and the approved design mockup draft (`redesign-mockup.html`), outlining the exact changes required to achieve a 1:1 match with the mockup's cold monochrome slate/black/white design while preserving the high-performance 3D parallax background.

---

## 1. Primary Font Switch (Geist to Inter)

### Analysis
The current site uses `Geist` as the primary sans-serif font and `Geist_Mono` for monospace. The approved mockup specifies `Inter` for the body/sans-serif text and `JetBrains Mono` for monospace text.

### Proposed Changes
To switch the primary font in `src/app/layout.tsx` using `next/font/google`:

1. **Modify `layout.tsx`**:
   - Replace the `Geist` import with `Inter` and `JetBrains_Mono` (optional but recommended to match the mockup's monospace elements).
   - Initialize the `Inter` font with a CSS variable `--font-sans` (or `--font-inter`).
   - Inject the new font variables into the `html` element's class list.

#### Code Snippet: `src/app/layout.tsx`
```tsx
// BEFORE (Lines 1-15)
import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// AFTER
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});
```

2. **Modify `src/app/globals.css`**:
   - Update the `@theme inline` block to map `--font-sans` and `--font-mono` to the new CSS variables if needed. If mapped directly to `--font-sans` and `--font-mono` in `layout.tsx`, the Tailwind v4 theme will inherit them automatically.
   - Remove the old `--font-geist-sans` and `--font-geist-mono` references.

---

## 2. Animated Film Grain Noise Effect

### Analysis
The mockup applies a global, animated film grain noise effect using a high-frequency SVG fractal noise background applied to a fixed `body::after` pseudo-element.

### Proposed Changes
Add the following CSS rules to `src/app/globals.css`. Since the current `body::after` is used for colorful ambient glows, it must be completely replaced by the film grain overlay.

#### Code Snippet: `src/app/globals.css`
```css
/* Replace the existing body::after with this global overlay */
body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: 9999; /* Sit on top of all content */
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

---

## 3. Removing Colorful Gradients, Glows, and Blobs

### Analysis
To achieve a 100% cold monochrome slate/black/white design, all colorful variables, ambient gradients, and glowing effects must be stripped from `src/app/globals.css`.

### Elements to Remove/Modify in `src/app/globals.css`

1. **Color Variables in `:root` (Lines 11-27)**:
   - Remove: `--accent-aqua`, `--accent-mint`, `--accent-rose`, `--accent-amber`, `--page-gradient-a`, `--page-gradient-b`, `--page-gradient-c`, `--page-gradient-d`, `--ambient-a`, `--ambient-b`, `--liquid-primary`, and `--liquid-primary-shadow`.
   - Replace with monochrome design tokens:
     ```css
     :root {
       --ink: #000000;
       --ink-2: #080808;
       --ink-3: #111111;
       --surface: rgba(255, 255, 255, 0.03);
       --border: rgba(255, 255, 255, 0.07);
       --border-hover: rgba(255, 255, 255, 0.18);
       --text-primary: rgba(255, 255, 255, 0.95);
       --text-secondary: rgba(255, 255, 255, 0.45);
       --text-tertiary: rgba(255, 255, 255, 0.22);
       --accent: #ffffff;
       --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);
       --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
     }
     ```

2. **Theme Palettes (Lines 31-100)**:
   - Remove all `html[data-theme-palette="violet"]`, `html[data-theme-palette="graphite"]`, and `html[data-theme-palette="amber"]` overrides.

3. **Body Background (Lines 109-116)**:
   - Replace the colorful `linear-gradient` background with a solid black background:
     ```css
     body {
       min-height: 100vh;
       background: var(--ink);
       color: var(--text-primary);
     }
     ```

4. **Body Grid Overlay (Lines 118-129)**:
   - The current `body::before` grid is acceptable but should be simplified or blended to match the mockup's darker aesthetic.

5. **Glass Components & Buttons (Lines 185-284)**:
   - Remove colorful background gradients and glow shadows from `.glass-surface`, `.glass-panel`, `.glass-chip`, `.liquid-button-primary`, and `.liquid-button-secondary`.
   - Redefine them using monochrome translucent borders and surfaces (`var(--surface)` and `var(--border)`).

6. **Animated Background Blobs (Lines 361-391)**:
   - Remove `@keyframes blob-pivot-1`, `blob-pivot-2`, and `blob-pivot-3`.
   - Remove `.animate-blob-1`, `.animate-blob-2`, and `.animate-blob-3`.
   - Remove `@keyframes text-glow-pulse` and `.portfolio-text-glow` (which adds colorful text glow).

7. **Web3D Dark Theme / AutoPiac Intranet (Lines 801-970)**:
   - Remove all colorful `radial-gradient` backgrounds from `.ap3d-shell`.
   - Remove color-based border glows and hover states.

8. **Showroom Shapes (Lines 1025-1113)**:
   - **Completely remove** the `.showroom-shapes` styles. These are the large floating colorful background blobs.

9. **Pill Nav & HUD Elements (Lines 1445-1495)**:
   - Ensure `.hud-nav`, `.hud-panel`, and `.hud-card` use monochrome borders.
   - Modify `.hud-pulse-bubble` to use a white/gray pulse instead of emerald green (`#10b981`).

---

## 4. Component Redesign in `portfolio-onepager.tsx`

To match the mockup 1:1, the layouts, classes, and structures in `src/components/portfolio-onepager.tsx` must be refactored as follows:

### A. Nav Bar (Floating Pill Style)
- **Current**: Full-width header spanning the top.
- **Redesign**: Replace with a floating, centered pill nav.
- **Structure**:
  ```tsx
  <nav className="nav">
    <span className="nav-logo">FLZ</span>
    <button onClick={() => scrollToSection("hero")} className="nav-link active">Home</button>
    <button onClick={() => scrollToSection("archive")} className="nav-link">Archive</button>
    <button onClick={() => scrollToSection("process")} className="nav-link">Process</button>
    <button onClick={() => scrollToSection("signals")} className="nav-link">Contact</button>
  </nav>
  ```

### B. Hero Section
- **Current**: Missing entirely.
- **Redesign**: Add a full-screen hero section (`100vh`) right after `LandingParallax`.
- **Structure**:
  - Parallax background overlay.
  - Floating depth elements (connected to mouse movement).
  - SVG wireframe car silhouette placeholder.
  - Edge vignette.
  - Side scroll track indicators.
  - Hero content (Eyebrow, outlined/solid Wordmark, Tagline, Stats, and Call-to-Action buttons).

### C. Running Ticker
- **Current**: Uses custom Tailwind marquee utility classes.
- **Redesign**: Update to use the mockup's semantic classes: `.ticker-wrap`, `.ticker-inner`, `.ticker-item`, and `.ticker-dot`.
- **Structure**:
  ```tsx
  <div className="ticker-wrap">
    <div className="ticker-inner">
      {Array.from({ length: 4 }).map((_, i) => (
        <span key={i} className="ticker-item">
          3D Automotive Design<span className="ticker-dot" />
          System Architecture<span className="ticker-dot" />
          High-Performance Rendering<span className="ticker-dot" />
          Prototype Development<span className="ticker-dot" />
          FLZ Works · 2026<span className="ticker-dot" />
          Machine Experience<span className="ticker-dot" />
        </span>
      ))}
    </div>
  </div>
  ```

### D. Process & Interface Narrative Sections
- **Current**: Rendered as simple centered text blocks.
- **Redesign**: Rebuild as 2-column grids (`narrative-section`) matching the mockup.
- **Structure**:
  - **Process (Section 1)**: Left side: `.narrative-visual` containing the "DESIGN SYSTEM" wireframe SVG and `.narrative-visual-tag` ("3D Auto · 2026"). Right side: `.narrative-text` containing the title, body, and link.
  - **Interface (Section 2)**: Same structure but with `.reverse` (RTL direction). Left side: `.narrative-visual` containing the "INTERFACE ARCHITECTURE" wireframe SVG and tag ("UI/UX · Figma"). Right side: `.narrative-text`.

### E. Selected Works Masonry Grid
- **Current**: Fixed aspect-ratio cards in a standard 3-column CSS Grid.
- **Redesign**: Switch to a true CSS columns-based masonry grid.
- **Card Sizing**: Map the dynamic articles to different aspect ratios based on their index:
  - Index `i % 3 === 0` -> `.masonry-tall` (Aspect 3:4)
  - Index `i % 3 === 1` -> `.masonry-wide` (Aspect 16:9)
  - Index `i % 3 === 2` -> `.masonry-square` (Aspect 1:1)
- **Fallback Art**: If an article does not have an image, render one of the mockup's custom SVG wireframe drawings (Mirsairen curves, Hydra lines, System UI grids, Athaan curves, Godot crosshairs, Web Arch grids) to maintain the premium technical aesthetic.
- **Hover Shimmer**: Implement the mouse-coordinate tracking shimmer effect:
  ```tsx
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };
  ```

### F. Identity Strip
- **Current**: Styled with Tailwind utilities.
- **Redesign**: Refactor using the mockup's class names (`identity-strip`, `identity-mark`, `identity-info`, etc.) to ensure exact margins, typography, and hover states.

### G. Footer
- **Current**: Simple marquee and copy strip.
- **Redesign**: Replace with the 3-column mockup footer containing:
  - Brand "FLZ" + "Design & Engineering · 2026"
  - Link column ("Archive", "Process", "Contact", "Instagram")
  - Monospace studio mission column.

### H. Proposal Bar
- **Current**: Missing.
- **Redesign**: Add a fixed floating bar at the bottom with a pulsing indicator:
  ```tsx
  <div className="proposal-bar">
    <div className="proposal-dot" />
    <span className="proposal-label">Design Preview</span>
    <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)" }} />
    <span className="proposal-label-main">FLZ Works — New Structure</span>
  </div>
  ```

---

## 5. Preservation of 3D Parallax Background

### Analysis
The current `LandingParallax` component (`landing-parallax.tsx`) is a highly sophisticated, mouse-tracked 3D parallax effect using layered WebP images (`Back.webp`, `Lego.webp`, `Athaan.webp`, `Gato.webp`) with lerped animation.

The mockup uses a simple CSS-only gradient background with static floating depth elements.

### Integration Strategy
1. **Preserve `LandingParallax`**: Keep the component active at the root of `portfolio-onepager.tsx`. It is fixed-positioned and will render behind the entire viewport.
2. **Merge Depth Elements**: Move the mockup's floating depth elements (e.g., the vertical line, the vertical text "3D Auto Design", the circle, and "MIRSAIREN 2026") into `landing-parallax.tsx`. 
3. **Smooth Mouse-Tracking**: Instead of using the mockup's CSS keyframe animations, map these depth elements to the existing React refs (`depthRefs`) and lerp calculations in `landing-parallax.tsx`. This will give them a highly responsive, fluid 3D parallax movement that reacts to the mouse.
4. **Hero Section Transparency**: Keep the Hero section's background transparent (do not use the mockup's solid `.parallax-bg` gradient) so that the 3D WebP layers shine through. Retain the `.hero-vignette` in the Hero section to blend the edges of the 3D scene into the black body background.
