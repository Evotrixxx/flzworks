# Project Plan: Portfolio Redesign to 1:1 Mockup Match

This plan outlines the steps required to redesign the live portfolio website to match the approved design mockup draft (`redesign-mockup.html`) 1:1.

## Milestones

### Milestone 1: Exploration and Analysis
- **Goal**: Analyze the differences between the current live site (`layout.tsx`, `globals.css`, `portfolio-onepager.tsx`) and the design mockup (`redesign-mockup.html`).
- **Details**:
  - Identify all font changes (switching Geist to Inter).
  - Identify all legacy color accents, gradients, and glows to be removed.
  - Plan the animated film grain noise effect globally.
  - Plan the layout changes (navigation, hero, narrative sections, masonry grid, identity strip, footer, proposal bar).
  - Ensure the 3D parallax background is preserved.
- **Verification**: Handoff reports from 3 Explorers with a clear implementation strategy.

### Milestone 2: Implementation of Global Theme, Font & Noise
- **Goal**: Implement the global font, global film grain noise, and the cold monochrome color palette in `layout.tsx` and `globals.css`.
- **Details**:
  - Switch sans-serif font from Geist to Inter in `layout.tsx` (using `next/font/google`).
  - Add the animated film grain noise effect globally on `body::after` in `globals.css`.
  - Update CSS variables in `globals.css` to use the cold monochrome palette (pure black backgrounds, ice white typography, slate borders).
  - Remove all legacy gradients, background blobs, and glow effects from `globals.css`.
- **Verification**: Successful compilation and review.

### Milestone 3: Implementation of Portfolio Onepage Layout Redesign
- **Goal**: Update `portfolio-onepager.tsx` to match the mockup's layout, components, and interactive styles 1:1.
- **Details**:
  - Update the navigation to a floating pill nav (`.nav` class).
  - Redesign the Hero section with the large Cormorant Garamond wordmark, metadata, and buttons.
  - Implement the two narrative sections (Process and Interface) with their respective SVG illustrations and copy.
  - Implement the Masonry Grid for the selected works/articles, including the refraction shimmer effect on hover and the overlay metadata.
  - Update the Identity Strip and the Footer.
  - Add the Proposal Bar at the bottom.
  - Retain the `<LandingParallax />` component for the 3D parallax background.
  - Retain the detail modal and lightbox functionality.
- **Verification**: Successful build and visual verification.

### Milestone 4: Verification, Testing & QA
- **Goal**: Verify visual alignment, performance, and functionality.
- **Details**:
  - Run `npm run typecheck` to verify TypeScript compilation.
  - Run `npm run build` to verify the production build succeeds.
  - Verify that no legacy color accents remain.
  - Verify that the 3D parallax background is fully operational.
  - Perform review, challenger checks, and forensic auditing.
- **Verification**: Clean audit verdict, passing typecheck/build, and successful E2E/manual verification.

## Interface Contracts
No new cross-module interface contracts are introduced, as this is a visual and layout redesign of the existing portfolio page. The props passed to `PortfolioOnepager` (`instagramMedia`, `articles`) remain unchanged.
