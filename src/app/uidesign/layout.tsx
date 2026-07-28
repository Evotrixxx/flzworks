import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s — flz.works/uidesign",
    default: "UI Design Showcase — flz.works",
  },
  description:
    "A curated gallery of premium UI/UX design systems by flz.works — featuring glassmorphism, WebGL refraction, and cutting-edge interaction patterns.",
};

export default function UiDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="uidesign-root font-sans" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
      {/* Global shell header */}
      <header className="uidesign-shell-header">
        <Link href="/" className="uidesign-back-home" aria-label="Back to flz.works">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>flz.works</span>
        </Link>
        <Link href="/uidesign" className="uidesign-wordmark">
          <span className="uidesign-wordmark-pre">UI</span>
          <span className="uidesign-wordmark-sep">/</span>
          <span className="uidesign-wordmark-main">DESIGN</span>
        </Link>
        <div className="uidesign-header-right">
          <span className="uidesign-badge">Showcase Gallery</span>
        </div>
      </header>

      {/* Page content */}
      <main className="uidesign-main">
        {children}
      </main>
    </div>
  );
}
