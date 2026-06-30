# Original User Request

## Initial Request — 2026-06-29T13:40:30Z

Implement the design critique recommendations for FLZ Works `portfolio-onepager.tsx` and its CMS counterpart `magazine-admin.tsx` to fix critical runtime bugs, improve typography consistency, resolve contrast and accessibility issues, and translate the CMS interface to English.

Working directory: `c:/Users/7bflo/OneDrive/Dokumentumok/used car marketplace`
Integrity mode: development

## Requirements

### R1. Resolve Usability Issues
- **Fix the Showroom mode bug**: Clicking a masonry card while UI is hidden (showroom mode) triggers the card's `onClick` AND exits showroom mode simultaneously. It should either exit showroom mode on first click (without opening the article details) or handle the event propagation correctly (e.g. via `e.stopPropagation()`).
- **Clean up redundant hero CTAs**: Remove the "Scroll to Explore" button, keeping only the primary "View Archive" and the "↓ scroll to begin" hint.
- **Fix navigation and footer links**: Rename the "Contact" nav link to "Signals" or "Feed" (since it routes to `#signals`), and make the footer "Instagram" span a proper link `<a href="https://instagram.com/flzworks" target="_blank">`.
- **Make stats dynamic**: Replace the hardcoded "12 Projects" with `{publicArticles.length}`.
- **Refine category filtering**: Drive the categories directly from the article's `category` field rather than checking if the folder name includes `"lego"` or if the title includes other keywords.

### R2. Improve Visual Hierarchy and Consistency
- **Standardize typography**: Integrate `Cormorant Garamond` (`font-serif`) consistently across the site (e.g., in the identity strip, narrative titles, and section headings) to establish a deliberate, premium serif layer alongside the `Inter` sans-serif font.
- **Map card sub-labels**: Replace the ternary `article.category === "CAR_DESIGN" ? "3D Auto" : "Design & Dev"` with a proper category-to-label map supporting all categories (e.g., "Automotive", "Brickworks", "Games", "Media", "Other").
- **Track active sections**: Ensure the "interface" narrative section (between archive and identity) is properly tracked in `activeSection` and its dot activates as expected.
- **Verify CSS classes**: Confirm that `fill-1` through `fill-5` classes are defined in `globals.css` so that wireframe placeholders have the correct background tones.

### R3. Enhance Accessibility (WCAG Compliance)
- **Increase color contrast**: Lift all low-contrast text (e.g., `text-white/30`, `text-white/40`, `text-white/45`) to a minimum of `text-white/60` (or `text-white/70` for AA compliance) on the black background.
- **Add ARIA labels to Lightbox**: Replace or wrap the `←` and `→` Unicode arrows in the lightbox with accessible descriptions, or add `aria-label="Previous image"` / `aria-label="Next image"` to the buttons.
- **Add ARIA labels to Scroll Dots**: Add `aria-label="Scroll to [section]"` to the side scroll dots.
- **Improve touch targets**: Increase the interactive area of the navigation buttons to meet the 44x44px recommendation (e.g., via `min-h-[44px] min-w-[44px]` or larger padding).

### R4. English Translation and CMS Update
- **CMS Translation**: Translate all Hungarian labels and text in `magazine-admin.tsx` to English (e.g. translate "Cikk megnevezése (Cím)" to "Project Title", "Létrehozás dátuma" to "Date Created", "Kategória besorolás" to "Category", "Látható" to "Visible", "Rejtett" to "Hidden").
- **CMS Categories**: Add `CAR_DESIGN` (Automotive), `BRICKWORKS` (Brickworks), `GAMES` (Games), `MEDIA` (Media), and `OTHER` (Other) as actual selectable categories in the CMS dropdown in `magazine-admin.tsx`.
- **Smart defaults in sync**: Update `syncPortfolioArticles` in `src/lib/portfolio-sync.ts` to assign appropriate default categories based on folder/title keywords when importing new projects (e.g., folder includes "lego" -> `BRICKWORKS`, folder includes "godot" -> `GAMES`).

## Acceptance Criteria

### Usability & Functionality
- [ ] Showroom mode exit is clean: clicking anywhere to exit showroom mode does not trigger a card's detail modal.
- [ ] Only "View Archive" and "↓ scroll to begin" remain in the hero CTA area.
- [ ] The "Contact" nav link is renamed to "Signals" and correctly targets the Instagram grid.
- [ ] The footer "Instagram" link is a working `<a>` tag pointing to `https://instagram.com/flzworks`.
- [ ] The projects count stat dynamically renders the number of public articles.
- [ ] The category filtering matches articles by their actual category field.

### Consistency & Aesthetics
- [ ] Typography is unified: `Cormorant Garamond` is integrated into narrative titles and the identity strip.
- [ ] Masonry card sub-labels display appropriate text based on their category (e.g., "Automotive", "Brickworks", "Games", "Media", "Other") instead of defaulting everything non-car to "Design & Dev".
- [ ] All page sections (including the "interface" section) are tracked by the scroll spy and have corresponding scroll dots.
- [ ] Placeholder card styles (`fill-1` to `fill-5`) are verified and functional.

### Accessibility
- [ ] Text elements have a contrast ratio of at least 4.5:1 (using `text-white/60` or higher for secondary text on black).
- [ ] Screen readers can identify the purpose of the lightbox navigation buttons and scroll dots via ARIA labels.
- [ ] Navigation buttons have a minimum touch target size of 44x44px.

### CMS & Translation
- [ ] All UI text in `magazine-admin.tsx` is in English.
- [ ] The CMS dropdown lists all five categories with English labels.
- [ ] `syncPortfolioArticles` classifies new articles into `CAR_DESIGN`, `BRICKWORKS`, `GAMES`, `MEDIA`, or `OTHER` based on folder/title keywords.
