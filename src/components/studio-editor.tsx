"use client";

import { useState } from "react";
import Image from "next/image";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import type { SocialEntry } from "@/lib/social-config";

type SaveState = "idle" | "saving" | "success" | "error";

interface LogForm {
  title: string;
  date: string;
  description: string;
  visible: boolean;
  category: string;
}

interface StudioEditorProps {
  articles: PortfolioArticleWithImages[];
  social: SocialEntry[];
  userEmail: string;
}

export function StudioEditor({ articles, social, userEmail }: StudioEditorProps) {
  return (
    <div className="bp-root bp-studio">
      <header className="bp-topbar">
        <a href="/" className="bp-logo" style={{ textDecoration: "none" }}>
          FLZ.WORKS · STUDIO
        </a>
        <div className="bp-studio-headmeta">
          <span className="bp-studio-user">{userEmail}</span>
          <a href="/" className="bp-studio-headlink">VIEW SITE ↗</a>
          <SignOutButton />
        </div>
      </header>

      <main className="bp-studio-main">
        <LogPostsPanel articles={articles} />
        <TransmissionsPanel initial={social} />
      </main>
    </div>
  );
}

function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      className="bp-studio-headlink"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } finally {
          window.location.href = "/";
        }
      }}
    >
      SIGN OUT
    </button>
  );
}

/* ── Log posts (portfolio articles) ── */
function LogPostsPanel({ articles }: { articles: PortfolioArticleWithImages[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, SaveState>>({});
  const [forms, setForms] = useState<Record<string, LogForm>>(() => {
    const initial: Record<string, LogForm> = {};
    for (const a of articles) {
      initial[a.id] = {
        title: a.title,
        date: a.date,
        description: a.description ?? "",
        visible: a.visible,
        category: a.category || "CAR_DESIGN",
      };
    }
    return initial;
  });

  const setField = (id: string, patch: Partial<LogForm>) => {
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    setStatus((prev) => (prev[id] && prev[id] !== "idle" ? { ...prev, [id]: "idle" } : prev));
  };

  const save = async (id: string, folderName: string) => {
    const values = forms[id];
    setStatus((prev) => ({ ...prev, [id]: "saving" }));
    try {
      const res = await fetch("/api/portfolio/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, folderName, ...values }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Save failed");
      setStatus((prev) => ({ ...prev, [id]: "success" }));
      setTimeout(() => setStatus((prev) => ({ ...prev, [id]: "idle" })), 2500);
    } catch (err) {
      console.error(err);
      setStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  return (
    <section className="bp-studio-panel">
      <div className="bp-studio-panel-head">
        <span className="bp-section-label bp-accent">■ SHEET INDEX — LOG POSTS</span>
        <span className="bp-studio-count">{articles.length} ON FILE</span>
      </div>

      <div className="bp-studio-rows">
        {articles.map((article) => {
          const id = article.id;
          const form = forms[id];
          const isOpen = expandedId === id;
          const st = status[id] || "idle";
          const cover = article.images[0]
            ? `/api/portfolio/media/${article.folderName}/${article.images[0]}?w=200`
            : null;

          return (
            <div key={id} className={`bp-studio-row${isOpen ? " is-open" : ""}`}>
              <button
                type="button"
                className="bp-studio-row-head"
                onClick={() => setExpandedId(isOpen ? null : id)}
              >
                <span className="bp-studio-row-thumb">
                  {cover ? (
                    <Image src={cover} alt="" fill sizes="46px" className="bp-studio-row-thumb-img" unoptimized />
                  ) : (
                    <span className="bp-studio-row-thumb-empty">—</span>
                  )}
                </span>
                <span className="bp-studio-row-main">
                  <span className="bp-studio-row-folder">{article.folderName}</span>
                  <span className="bp-studio-row-title">{form.title || article.title}</span>
                </span>
                <span className="bp-studio-row-flags">
                  <span className={`bp-tag${form.visible ? " is-on" : " is-off"}`}>
                    {form.visible ? "VISIBLE" : "HIDDEN"}
                  </span>
                  <span className="bp-tag">
                    {form.category === "CAR_DESIGN" ? "3D AUTO" : "OTHER"}
                  </span>
                  {st === "saving" && <span className="bp-studio-stat">…</span>}
                  {st === "success" && <span className="bp-studio-stat bp-accent">✓</span>}
                  {st === "error" && <span className="bp-studio-stat bp-studio-stat-err">!</span>}
                  <span className="bp-studio-chev">{isOpen ? "−" : "+"}</span>
                </span>
              </button>

              {isOpen && (
                <div className="bp-studio-row-body">
                  <div className="bp-studio-grid3">
                    <label className="bp-studio-field">
                      <span className="bp-studio-label">TITLE</span>
                      <input
                        className="bp-field"
                        value={form.title}
                        onChange={(e) => setField(id, { title: e.target.value })}
                      />
                    </label>
                    <label className="bp-studio-field">
                      <span className="bp-studio-label">DATE (YYYY-MM-DD)</span>
                      <input
                        className="bp-field"
                        value={form.date}
                        onChange={(e) => setField(id, { date: e.target.value })}
                      />
                    </label>
                    <label className="bp-studio-field">
                      <span className="bp-studio-label">CATEGORY</span>
                      <select
                        className="bp-field"
                        value={form.category}
                        onChange={(e) => setField(id, { category: e.target.value })}
                      >
                        <option value="CAR_DESIGN">3D AUTOMOTIVE</option>
                        <option value="OTHER">OTHER</option>
                      </select>
                    </label>
                  </div>

                  <label className="bp-studio-field">
                    <span className="bp-studio-label">DESCRIPTION</span>
                    <textarea
                      className="bp-field"
                      rows={4}
                      value={form.description}
                      onChange={(e) => setField(id, { description: e.target.value })}
                    />
                  </label>

                  <div className="bp-studio-row-actions">
                    <label className="bp-studio-check">
                      <input
                        type="checkbox"
                        checked={form.visible}
                        onChange={(e) => setField(id, { visible: e.target.checked })}
                      />
                      <span>SHOW IN SHEET INDEX</span>
                    </label>
                    <button
                      type="button"
                      className="bp-btn"
                      disabled={st === "saving"}
                      onClick={() => save(id, article.folderName)}
                    >
                      {st === "saving" ? "SAVING…" : st === "error" ? "RETRY SAVE" : "SAVE SHEET"}
                    </button>
                  </div>

                  {article.images.length > 0 && (
                    <div className="bp-studio-plate">
                      <span className="bp-studio-label">
                        MEDIA ({article.images.length}) — first image is the filmstrip cover
                      </span>
                      <div className="bp-studio-thumbs">
                        {article.images.slice(0, 12).map((img) => (
                          <span key={img} className="bp-studio-thumb">
                            <Image
                              src={`/api/portfolio/media/${article.folderName}/${img}?w=160`}
                              alt=""
                              fill
                              sizes="72px"
                              className="bp-studio-thumb-img"
                              unoptimized
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ── Social transmissions ── */
function TransmissionsPanel({ initial }: { initial: SocialEntry[] }) {
  const [entries, setEntries] = useState<SocialEntry[]>(initial);
  const [state, setState] = useState<SaveState>("idle");

  const update = (
    platform: string,
    patch: Partial<Pick<SocialEntry, "label" | "postUrl" | "imageUrl">>,
  ) => {
    setEntries((prev) => prev.map((e) => (e.platform === platform ? { ...e, ...patch } : e)));
    if (state !== "idle") setState("idle");
  };

  const save = async () => {
    setState("saving");
    try {
      const res = await fetch("/api/portfolio/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entries }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Save failed");
      setState("success");
      setTimeout(() => setState("idle"), 2500);
    } catch (err) {
      console.error(err);
      setState("error");
    }
  };

  return (
    <section className="bp-studio-panel">
      <div className="bp-studio-panel-head">
        <span className="bp-section-label bp-accent">■ TRANSMISSIONS — SOCIAL</span>
        <button type="button" className="bp-btn" disabled={state === "saving"} onClick={save}>
          {state === "saving"
            ? "SAVING…"
            : state === "success"
              ? "SAVED ✓"
              : state === "error"
                ? "RETRY SAVE"
                : "SAVE TRANSMISSIONS"}
        </button>
      </div>

      <p className="bp-studio-note">
        Paste each platform&apos;s latest post link and an image URL — the social cards show that
        image and open the post. Leave the Instagram image blank to auto-use the latest post from
        the connected Instagram feed (if a token is configured).
      </p>

      <div className="bp-studio-social">
        {entries.map((entry) => (
          <div key={entry.platform} className="bp-studio-social-row">
            <div className="bp-studio-social-preview">
              {entry.imageUrl ? (
                <Image
                  src={entry.imageUrl}
                  alt=""
                  fill
                  sizes="120px"
                  className="bp-studio-social-img"
                  unoptimized
                />
              ) : (
                <span className="bp-studio-social-empty">{entry.platform}</span>
              )}
            </div>
            <div className="bp-studio-social-fields">
              <label className="bp-studio-field">
                <span className="bp-studio-label">LABEL</span>
                <input
                  className="bp-field"
                  value={entry.label}
                  onChange={(e) => update(entry.platform, { label: e.target.value })}
                />
              </label>
              <label className="bp-studio-field">
                <span className="bp-studio-label">POST URL</span>
                <input
                  className="bp-field"
                  placeholder="https://…"
                  value={entry.postUrl}
                  onChange={(e) => update(entry.platform, { postUrl: e.target.value })}
                />
              </label>
              <label className="bp-studio-field">
                <span className="bp-studio-label">IMAGE URL</span>
                <input
                  className="bp-field"
                  placeholder="https://… (or /api/portfolio/media/…)"
                  value={entry.imageUrl}
                  onChange={(e) => update(entry.platform, { imageUrl: e.target.value })}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
