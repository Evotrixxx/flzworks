# Original User Request

## 2026-07-28T15:16:57Z

Execute a comprehensive design, alignment, and profile-fidelity audit over the FLZ portfolio surface of the Next.js codebase based on AUDIT_PLAN.md and C:\Ai_source\FLZ_profil\PROFILE.md.

Working directory: g:/Saját meghajtó/used car marketplace
Integrity mode: development

## Requirements

### R1. Portfolio Surface Audit & PROFILE.md Alignment
Inspect and update the portfolio surface (src/components/lucid-landing.tsx, src/app/page.tsx, src/app/layout.tsx, src/app/globals.css, /studio, /id, /autosalon) so all personal details, timeline dates, education, contact info, and tech stack match PROFILE.md with 100% fidelity. Do NOT touch the intranet/autopiac used-car marketplace.

### R2. Design & Liquid-Glass System Tightening
Eliminate FOUC by moving runtime <style> injection (CSS_KEYFRAMES / StyleInjector) into globals.css. Consolidate token layers, normalise glass panel border-radii (12px / 16px / 24px), verify WCAG AA contrast (≥ 4.5:1), letter-spacing (0.12-0.13em), font-feature-settings for stats, and prefers-reduced-motion media query wrapping.

### R3. Cross-Route Consistency & Metadata
Ensure /, /studio, /id, /autosalon, and /autosalon-new share uniform fonts, headers, footers, and metadata descriptions. Split personal portfolio metadata from AutoPiac intranet copy. Fix <noscript> fallbacks and ensure correct indexability (robots/sitemap).

### R4. Audit Deliverables
Generate AUDIT_FINDINGS.md at the repository root summarizing issues found, severity (P0/P1/P2), and resolution status.

## Acceptance Criteria

### Content & Profile Fidelity
- [ ] Name Flosz Bence Norbert (or Bence Flosz), roles, BGE studies, and experience timeline match PROFILE.md.
- [ ] Contact links (Email, LinkedIn, GitHub) are verified and present across portfolio routes.
- [ ] No intranet/autopiac copy in portfolio <noscript> or site metadata.

### Design System & Accessibility
- [ ] StyleInjector removed; CSS_KEYFRAMES integrated cleanly in CSS stylesheet layer.
- [ ] No horizontal scroll at 320px, 375px, 768px, 1024px, 1280px, 1440px, or 1920px viewports.
- [ ] Keyframe animations respect prefers-reduced-motion.
- [ ] Text contrast ratios satisfy WCAG 2.1 AA (≥ 4.5:1 for normal text).
- [ ] AUDIT_FINDINGS.md created at repo root listing all P0 and P1 audit items.
