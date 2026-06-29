# Analysis: Portfolio Redesign Comparison

This report details the comparison between the current live portfolio website and the approved design mockup draft (`redesign-mockup.html`). It outlines the exact changes required in the codebase to align the site 1:1 with the mockup while preserving the sophisticated 3D parallax background.

---

## 1. Font Configuration (`layout.tsx`)

### Current State
The current layout uses **Geist** as the primary sans-serif font and **Geist Mono** as the monospace font.

```tsx
// src/app/layout.tsx (Lines 6-14)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### Mockup Design
The mockup specifies **Inter** as the primary sans-serif font, **Cormorant Garamond** as the serif font, and **JetBrains Mono** as the monospace font.

```html
<!-- redesign-mockup.html (Lines 7-8) -->
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=JetBrains+Mono:wght@300;400;500;600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
```

### Action Plan
Switch the primary sans-serif font from Geist to Inter, and the monospace font from Geist Mono to JetBrains Mono in `src/app/layout.tsx` using `next/font/google`.

#### Proposed Code Change for `src/app/layout.tsx`
```tsx
import { Inter, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Update the <html> className:
<html
  lang={locale}
  suppressHydrationWarning
  className={`${inter.variable} ${jetbrainsMono.variable} ${cormorantGaramond.variable} h-full antialiased`}
>
```

---

## 2. Animated Film Grain Noise (`globals.css`)

### Current State
The current site has a subtle static noise texture on `.portfolio-shell::after` with very low opacity (`0.04`) and a vibrating animation (`noise-vibrate`). It also has a colorful ambient gradient on `body::after`.

### Mockup Design
The mockup applies a global, highly tactile animated film grain overlay across the entire site via `body::after` with a high `z-index` (`9999`), placing it on top of all text, images, and backgrounds.

```css
/* redesign-mockup.html (Lines 45-62) */
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

### Action Plan
1. In `src/app/globals.css`, replace the existing `body::after` (which creates a colorful ambient glow) with the mockup's animated film grain style.
2. Add `@keyframes grain` to the stylesheet.
3. Remove the `.portfolio-shell::after` animated noise overlay to avoid redundant noise calculations.
4. Set `pointer-events: none` on the film grain overlay so it does not interfere with user clicks.

---

## 3. Clean-Up of Gradients, Glows, and Blobs (`globals.css`)

To transition from the current colorful, glassmorphic aqua/violet/amber design to the mockup's cold, minimalist monochrome slate/black/white aesthetic, the following styles must be removed or modified.

### Elements to Remove or Modify in `src/app/globals.css`

1. **Theme Variable Colors**: Remove all colorful variables and simplify `:root` to a strict black/white/slate scheme:
   - **Remove**: `--accent-aqua`, `--accent-mint`, `--accent-rose`, `--accent-amber`, `--page-gradient-a` through `--page-gradient-d`, `--page-base-a` through `--page-base-c`, `--ambient-a`, `--ambient-b`, `--liquid-primary`, `--liquid-primary-shadow`.
   - **Replace with**:
     ```css
     :root {
       --background: #000000;
       --foreground: rgba(255,255,255,0.95);
       --ink: #000000;
       --ink-2: #080808;
       --ink-3: #111111;
       --surface: rgba(255,255,255,0.03);
       --border: rgba(255,255,255,0.07);
       --border-hover: rgba(255,255,255,0.18);
       --text-primary: rgba(255,255,255,0.95);
       --text-secondary: rgba(255,255,255,0.45);
       --text-tertiary: rgba(255,255,255,0.22);
       --accent: #ffffff;
       --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.15);
       --ease-smooth: cubic-bezier(0.16, 1, 0.3, 1);
     }
     ```

2. **Theme Palette Overrides**: Remove the entire violet, graphite, and amber palette blocks (Lines 31-92).
3. **Glass Bold Variant**: Remove `html[data-glass="bold"]` (Lines 94-100).
4. **Body Background**: Remove the light, colorful dual-gradient background and grid overlay from `body` (Lines 111-129):
   - **Remove**: `linear-gradient(115deg, ...)` and `body::before` grid pattern.
   - **Replace with**:
     ```css
     body {
       min-height: 100vh;
       background: var(--ink);
       color: var(--text-primary);
       font-family: var(--font-sans), sans-serif;
       overflow-x: hidden;
     }
     ```
5. **Liquid Blobs & Glow Keyframes**: Remove `@keyframes blob-pivot-1`, `blob-pivot-2`, `blob-pivot-3` and their corresponding classes `.animate-blob-1`, `.animate-blob-2`, `.animate-blob-3` (Lines 362-390).
6. **Shell Grid**: Remove `.portfolio-shell::before` (isometric grid) (Lines 400-411).
7. **Bento Card Gradients**: Remove `.portfolio-bento-hero`, `.portfolio-bento-card`, and `.portfolio-archive-card` gradient backgrounds and borders.
8. **Text Glows**: Remove `.portfolio-text-glow` keyframes and text stroke styles (Lines 574-581).
9. **Filter Bar Accents**: Remove `.portfolio-filter-cyan` and `.portfolio-filter-purple` accent styles (Lines 614-626).
10. **Showroom Shift Keyframes**: Remove the complex showroom keyframes `@keyframes showroom-shift-a` through `@keyframes showroom-shift-e` (Lines 730-756).

---

## 4. Component Redesign (`portfolio-onepager.tsx`)

To match the mockup 1:1, `src/components/portfolio-onepager.tsx` requires a complete structural overhaul.

### A. Nav Bar (Floating Pill Nav)
* **Current**: A full-width top header (`fixed top-0 left-0 right-0 h-16 bg-black/40 border-b`).
* **Mockup**: A floating, centered pill nav bar.
* **Proposed Implementation**:
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
* **Current**: Missing. The page starts directly with the ticker and process description.
* **Mockup**: A dramatic full-screen hero section overlaying the 3D parallax background, containing a large wireframe car silhouette, floating text coordinates, a massive wordmark, and stats.
* **Proposed Implementation**:
  Add a `<section id="hero" className="hero">` containing:
  - Coordinate floating elements:
    ```tsx
    <div className="depth-element depth-el-1"></div>
    <div className="depth-element depth-el-2">3D Auto Design</div>
    <div className="depth-element depth-el-3"></div>
    <div className="depth-element depth-el-4">MIRSAIREN 2026</div>
    ```
  - An inline SVG wireframe car silhouette (from mockup lines 1053-1063) centered with absolute positioning.
  - A `.hero-vignette` div to blend the background.
  - A `.hero-scroll-track` scroll progress indicator.
  - A `.hero-content` container containing:
    - Eyebrow: `Portfolio — Design & Engineering · 2026`
    - Wordmark:
      ```tsx
      <div className="hero-wordmark">
        <span className="hero-wordmark-line1">FLZ</span>
        <span className="hero-wordmark-line2">Works</span>
      </div>
      ```
    - Tagline & Stats:
      ```tsx
      <div className="hero-meta">
        <p className="hero-tagline">Photorealistic automotive design, system architecture & high-performance web rendering.</p>
        <div className="hero-stats">
          <div className="hero-stat"><span className="hero-stat-num">12</span><span className="hero-stat-label">Projects</span></div>
          <div className="hero-stat"><span className="hero-stat-num">5+</span><span className="hero-stat-label">Years</span></div>
          <div className="hero-stat"><span className="hero-stat-num">∞</span><span className="hero-stat-label">Precision</span></div>
        </div>
      </div>
      ```
    - CTA Buttons and scroll hint.

### C. Running Ticker
* **Current**: Uses custom Tailwind classes and spans.
* **Mockup**: Uses `.ticker-wrap`, `.ticker-inner`, `.ticker-item`, and `.ticker-dot` styling.
* **Proposed Implementation**:
  ```tsx
  <div className="ticker-wrap">
    <div className="ticker-inner">
      {Array.from({ length: 2 }).map((_, idx) => (
        <span key={idx} className="flex items-center">
          <span className="ticker-item">3D Automotive Design<span className="ticker-dot"></span></span>
          <span className="ticker-item">System Architecture<span className="ticker-dot"></span></span>
          <span className="ticker-item">High-Performance Rendering<span className="ticker-dot"></span></span>
          <span className="ticker-item">Prototype Development<span className="ticker-dot"></span></span>
          <span className="ticker-item">FLZ Works · 2026<span className="ticker-dot"></span></span>
          <span className="ticker-item">Machine Experience<span className="ticker-dot"></span></span>
        </span>
      ))}
    </div>
  </div>
  ```

### D. Process & Interface Narrative Sections
* **Current**: Simple centered text blocks with no graphics or side-by-side layouts.
* **Mockup**: Two-column layouts. One column contains a technical SVG blueprint illustration with a floating tag, while the other contains typography and an animated link.
* **Proposed Implementation**:
  - **Process Section**:
    ```tsx
    <section id="process" className="narrative-section reveal">
      <div className="narrative-visual">
        <div className="narrative-img-placeholder fill-1 card-art" style={{ aspectRatio: "4/3" }}>
          <svg width="100%" height="100%" viewBox="0 0 600 450" fill="none">
            <rect width="600" height="450" fill="#0a0a0a"/>
            <circle cx="300" cy="225" r="120" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
            <circle cx="300" cy="225" r="80" stroke="rgba(255,255,255,0.06)" stroke-width="0.5"/>
            <line x1="180" y1="225" x2="420" y2="225" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
            <line x1="300" y1="105" x2="300" y2="345" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
            <text x="300" y="235" textAnchor="middle" fill="rgba(255,255,255,0.12)" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="4">DESIGN SYSTEM</text>
            <text x="300" y="260" textAnchor="middle" fill="rgba(255,255,255,0.06)" fontFamily="var(--font-mono)" fontSize="7" letterSpacing="3">PRECISION ENGINEERING</text>
          </svg>
        </div>
        <div className="narrative-visual-tag">3D Auto · 2026</div>
      </div>
      <div className="narrative-text">
        <div className="narrative-label">// 01 — Process</div>
        <h2 className="narrative-title">Where precision<br/><em>meets craft.</em></h2>
        <p className="narrative-body">Every project begins with a deep technical study of form, material, and motion. From clay model to rendered render, the workflow is engineered for maximum photorealism.</p>
        <span className="narrative-link" onClick={() => scrollToSection("archive")}>Explore the process</span>
      </div>
    </section>
    ```
  - **Interface Section**: Add a similar section with the class `reverse` and an interface blueprint SVG.

### E. Selected Works Masonry Grid
* **Current**: Standard 3-column Tailwind CSS grid where cards are of uniform height.
* **Mockup**: A true CSS multi-column masonry grid using `columns: 3` and `break-inside: avoid` with varying card sizes (`masonry-tall` for 3:4, `masonry-wide` for 16:9, `masonry-square` for 1:1) and a mouse-following shimmer refraction overlay.
* **Proposed Implementation**:
  Modify the card mapping in `portfolio-onepager.tsx`:
  ```tsx
  <div className="masonry-grid">
    {filteredArticles.map((article, i) => {
      const sizeClass = i % 3 === 0 ? "masonry-tall" : i % 3 === 1 ? "masonry-wide" : "masonry-square";
      const fillClass = `fill-${(i % 5) + 1}`;
      const firstImg = article.images.length > 0
        ? `/api/portfolio/media/${article.folderName}/${article.images[0]}`
        : null;

      return (
        <div
          key={article.id}
          className={`masonry-card ${sizeClass}`}
          onMouseMove={handleMouseMove}
          onClick={() => setSelectedArticle(article)}
        >
          <div className="masonry-card-index">#{String(i + 1).padStart(3, "0")}</div>
          
          <div className="relative w-full overflow-hidden bg-neutral-950/45">
            {firstImg ? (
              <div className="relative w-full h-full min-h-[200px]">
                <Image
                  src={firstImg}
                  alt={article.title}
                  fill
                  className="masonry-card-img object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  unoptimized
                />
              </div>
            ) : (
              <div className={`masonry-img-placeholder ${fillClass} card-art w-full h-full min-h-[200px]`}>
                <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" className="w-full h-full">
                  <rect width="100%" height="100%" fill="transparent"/>
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="rgba(255,255,255,0.08)" fontSize="10" letterSpacing="2">
                    {article.title.toUpperCase()}
                  </text>
                </svg>
              </div>
            )}
            <div className="masonry-card-overlay" />
          </div>

          <div className="masonry-card-meta">
            <div className="masonry-card-title">{article.title}</div>
            <div className="masonry-card-sub">
              {article.category === "CAR_DESIGN" ? "3D Auto" : "Design & Dev"} · 2026
            </div>
          </div>
        </div>
      );
    })}
  </div>
  ```

### F. Identity Strip
* **Current**: Uses Tailwind flex layout and tags.
* **Mockup**: Uses `.identity-strip`, `.identity-mark`, `.identity-info`, `.identity-name`, `.identity-bio`, `.identity-skills`, and `.identity-skill` classes.
* **Proposed Implementation**: Update the classes to match the mockup's CSS tokens.

### G. Footer
* **Current**: A running marquee and a simple copyright line.
* **Mockup**: A clean, structured 3-column footer containing brand information, local links, and a paragraph describing services.
* **Proposed Implementation**:
  ```tsx
  <footer className="footer">
    <div>
      <div className="footer-brand">FLZ</div>
      <div className="footer-meta">Design & Engineering · 2026</div>
    </div>
    <div className="footer-links">
      <button onClick={() => scrollToSection("hero")} className="footer-link text-left">Home</button>
      <button onClick={() => scrollToSection("archive")} className="footer-link text-left">Archive</button>
      <button onClick={() => scrollToSection("process")} className="footer-link text-left">Process</button>
      <span className="footer-link">Instagram</span>
    </div>
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "8px", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.15)", paddingTop: "8px", maxWidth: "200px", lineHeight: 1.8 }}>
      Photorealistic 3D Automotive Design · System Architecture · High-Performance Web Rendering
    </div>
  </footer>
  ```

### H. Proposal Bar
* **Current**: Missing.
* **Mockup**: A fixed bottom bar indicating the preview status.
* **Proposed Implementation**:
  ```tsx
  <div className="proposal-bar">
    <div className="proposal-dot"></div>
    <span className="proposal-label">Design Preview</span>
    <div style={{ width: "1px", height: "12px", background: "rgba(255,255,255,0.1)" }}></div>
    <span className="proposal-label-main">FLZ Works — New Structure</span>
  </div>
  ```

---

## 5. Parallax Integration (`landing-parallax.tsx`)

The existing 3D parallax background from `src/components/landing-parallax.tsx` is highly sophisticated, featuring multiple layered WebP images and interpolated mouse-tracking physics.

### Verification of Correct Integration
1. **No Layer Overlaps**: Keep `LandingParallax` at the top of the shell as `fixed inset-0 z-0`.
2. **Transparent Hero Section**: Make sure the newly added `<section id="hero" className="hero">` has `bg-transparent`. The mockup's static `.parallax-bg` (which is a simple radial gradient) should be used as a fallback or layered behind the text, but the primary visual backdrop must be the active `LandingParallax` component.
3. **Scroll-Responsive Blur**: The `LandingParallax` component listens to the window scroll and automatically applies a blur effect (`blur-md scale-[1.04]`) when `window.scrollY > 120`. This transitions the sharp 3D background into a soft, dark blur as the user scrolls down, ensuring that the Selected Works masonry grid and narrative sections remain perfectly legible.
4. **Coordinate Integration**: The floating depth elements in `LandingParallax` (e.g. "System Init // 0.1", "Mirsairen // 2026", and the spinning circle) are already animated with a 3D depth effect. They align perfectly with the mockup's aesthetic.

---

## 6. Implementation Summary Table

| Requirement | Current Code | Mockup Specification | Action Required |
|---|---|---|---|
| **Font Family** | Geist & Geist Mono | Inter, Cormorant Garamond, JetBrains Mono | Swap imports in `layout.tsx`, map to CSS variables |
| **Film Grain** | Mild static noise overlay on shell | Global animated grain via `body::after` | Replace `body::after` in `globals.css` with SVG + `@keyframes grain` |
| **Color Scheme** | Glassmorphic colors (Aqua, Violet, Amber) | 100% Monochrome slate/black/white | Remove color variables, palettes, bento gradients, and text glows |
| **Nav Bar** | Full-width top bar | Centered floating pill | Replace with floating pill nav |
| **Hero Section** | Missing | Large wordmark, wireframe SVG, stats, CTAs | Add hero overlay with transparent bg |
| **Works Grid** | Standard flex/grid, uniform cards | CSS Masonry with tall, wide, and square cards | Implement masonry layout using column properties and dynamic sizes |
| **Narrative** | Centered text blocks | Two-column grid with technical SVGs | Swap to two-column grid with inline blueprint SVGs |
| **Footer** | Marquee | Structured 3-column layout | Replace marquee footer with 3-column footer |
| **Proposal Bar** | Missing | Fixed bottom status bar | Add proposal bar component |
| **3D Parallax** | Active on homepage | Simulated in HTML | Preserve `LandingParallax` as the background; overlay the hero on top |
