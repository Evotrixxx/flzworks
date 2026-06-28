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
    <div className="uidesign-root">
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

      <style>{`
        .uidesign-root {
          min-height: 100vh;
          background: #04040a;
          color: #f0f0f5;
          font-family: 'Inter', system-ui, sans-serif;
          display: flex;
          flex-direction: column;
        }

        .uidesign-shell-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 200;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          background: rgba(4, 4, 10, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .uidesign-back-home {
          display: flex;
          align-items: center;
          gap: 6px;
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: color 0.2s;
        }
        .uidesign-back-home:hover { color: rgba(255,255,255,0.85); }

        .uidesign-wordmark {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
        }
        .uidesign-wordmark-pre { color: rgba(255,255,255,0.35); }
        .uidesign-wordmark-sep { color: rgba(255,255,255,0.15); }
        .uidesign-wordmark-main { color: rgba(255,255,255,0.9); }

        .uidesign-header-right {
          display: flex;
          align-items: center;
        }

        .uidesign-badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(160, 120, 255, 0.8);
          background: rgba(160, 120, 255, 0.08);
          border: 1px solid rgba(160, 120, 255, 0.18);
          padding: 3px 10px;
          border-radius: 20px;
        }

        .uidesign-main {
          flex: 1;
          padding-top: 56px;
        }
      `}</style>
    </div>
  );
}
