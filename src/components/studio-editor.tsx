"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { ExternalLink, FolderOpen, Layers, LogOut, Radio, SlidersHorizontal } from "lucide-react";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import type { SocialEntry } from "@/lib/social-config";
import { ArticlesPanel } from "@/components/studio/articles-panel";
import { ProjectsPanel } from "@/components/studio/projects-panel";
import { SettingsPanel } from "@/components/studio/settings-panel";
import { SocialPanel } from "@/components/studio/social-panel";
import { Spinner, ToastStack, type ToastItem, type ToastKind } from "@/components/studio/ui";
import { TelemetryCard } from "@/components/studio/telemetry-card";
import { SocialMetricsCard } from "@/components/studio/social-metrics-card";
import type { FlzProjectData } from "@/components/studio/types";
import type { SocialMetricsSnapshot } from "@/lib/social-metrics";
import type { TelemetrySnapshot } from "@/lib/telemetry";
import s from "@/components/studio/studio.module.css";

type Section = "projects" | "settings" | "articles" | "social";

interface StudioEditorProps {
  articles: PortfolioArticleWithImages[];
  social: SocialEntry[];
  flzProjects: FlzProjectData[];
  flzSettings: Record<string, string>;
  userEmail: string;
  telemetry: TelemetrySnapshot;
  telemetryLive?: boolean;
  socialMetrics: SocialMetricsSnapshot;
  socialMetricsLive?: boolean;
}

export function StudioEditor({
  articles,
  social,
  flzProjects,
  flzSettings,
  userEmail,
  telemetry,
  telemetryLive = true,
  socialMetrics,
  socialMetricsLive = true,
}: StudioEditorProps) {
  const [section, setSection] = useState<Section>("projects");
  const [projects, setProjects] = useState<FlzProjectData[]>(flzProjects);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  }, []);

  const nav: { id: Section; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "projects", label: "Projects", icon: <Layers size={16} />, count: projects.length },
    { id: "settings", label: "Site & hero", icon: <SlidersHorizontal size={16} /> },
    { id: "articles", label: "Articles", icon: <FolderOpen size={16} />, count: articles.length },
    { id: "social", label: "Social", icon: <Radio size={16} />, count: social.length },
  ];

  return (
    <div className={s.root}>
      <div className={s.orbA} />
      <div className={s.orbB} />

      <header className={s.topbar}>
        <Link href="/" className={s.brand}>
          <span className={s.brandMark}>
            Flz<span>.</span>studio
          </span>
        </Link>
        <span className={s.topSpacer} />
        <span className={s.userChip}>
          <span className={s.userDot} />
          <span className={s.userMail}>{userEmail}</span>
        </span>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className={`${s.btn} ${s.btnSm}`}
          title="Open flz.works in a new tab"
        >
          Live site <ExternalLink size={13} />
        </Link>
        <SignOutButton />
      </header>

      <div className={s.shell}>
        <aside className={s.sidebar}>
          <TelemetryCard initial={telemetry} live={telemetryLive} />
          <nav className={s.navList} aria-label="Studio sections">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={section === item.id ? "page" : undefined}
                className={`${s.navItem} ${section === item.id ? s.navItemActive : ""}`}
                onClick={() => setSection(item.id)}
              >
                <span className={s.navIcon}>{item.icon}</span>
                <span className={s.navLabel}>{item.label}</span>
                {item.count !== undefined && <span className={s.navCount}>{item.count}</span>}
              </button>
            ))}
          </nav>

          <SocialMetricsCard initial={socialMetrics} live={socialMetricsLive} />
        </aside>

        <main className={s.content}>
          <nav className={s.mobileNav} aria-label="Studio sections">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-current={section === item.id ? "page" : undefined}
                className={`${s.mobileNavItem} ${
                  section === item.id ? s.mobileNavItemActive : ""
                }`}
                onClick={() => setSection(item.id)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>

          {/*
            Every panel stays mounted and inactive ones are hidden with CSS.
            Unmounting them would throw away both their unsaved draft and the
            values they have already saved, so coming back to a section would
            show stale server props and the next save would write them back.
          */}
          <div className={`${s.sectionPane} ${section === "projects" ? "" : s.sectionHidden}`}>
            <ProjectsPanel projects={projects} setProjects={setProjects} notify={notify} />
          </div>
          <div className={`${s.sectionPane} ${section === "settings" ? "" : s.sectionHidden}`}>
            <SettingsPanel initialSettings={flzSettings} notify={notify} />
          </div>
          <div className={`${s.sectionPane} ${section === "articles" ? "" : s.sectionHidden}`}>
            <ArticlesPanel articles={articles} notify={notify} />
          </div>
          <div className={`${s.sectionPane} ${section === "social" ? "" : s.sectionHidden}`}>
            <SocialPanel initial={social} notify={notify} />
          </div>
        </main>
      </div>

      <ToastStack toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </div>
  );
}

function SignOutButton() {
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      className={`${s.btn} ${s.btnSm} ${s.btnGhost}`}
      disabled={busy}
      title="Sign out of the studio"
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          window.location.href = "/";
        }
      }}
    >
      {busy ? <Spinner size={14} /> : <LogOut size={14} />}
      <span className={s.signOutLabel}>Sign out</span>
    </button>
  );
}
