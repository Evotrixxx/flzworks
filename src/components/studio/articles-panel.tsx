"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronDown, FolderOpen, Images, Save } from "lucide-react";
import type { PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { EmptyState, Field, SearchBox, SectionHead, Segment, Spinner, Switch, type Notify } from "./ui";
import { ARTICLE_CATEGORIES, articleCategoryLabel } from "./types";
import s from "./studio.module.css";

type Filter = "all" | "visible" | "hidden";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
];

interface ArticleForm {
  title: string;
  date: string;
  description: string;
  visible: boolean;
  category: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toForm(a: PortfolioArticleWithImages): ArticleForm {
  return {
    title: a.title,
    date: a.date,
    description: a.description ?? "",
    visible: a.visible,
    category: a.category || "OTHER",
  };
}

export function ArticlesPanel({
  articles,
  notify,
}: {
  articles: PortfolioArticleWithImages[];
  notify: Notify;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  // `saved` is what the server last confirmed; `forms` is what the editor shows.
  const [saved, setSaved] = useState<Record<string, ArticleForm>>(() =>
    Object.fromEntries(articles.map((a) => [a.id, toForm(a)])),
  );
  const [forms, setForms] = useState<Record<string, ArticleForm>>(() =>
    Object.fromEntries(articles.map((a) => [a.id, toForm(a)])),
  );

  const set = (id: string, patch: Partial<ArticleForm>) =>
    setForms((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  // Filter on the server-confirmed values, never on the draft — otherwise the
  // row being edited drops out of the list mid-keystroke. The open row always
  // stays put for the same reason.
  const visibleList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return articles.filter((a) => {
      if (a.id === openId) return true;
      const base = saved[a.id];
      const matchesQuery =
        q === "" ||
        base.title.toLowerCase().includes(q) ||
        a.folderName.toLowerCase().includes(q) ||
        base.description.toLowerCase().includes(q);
      const matchesFilter =
        filter === "all" || (filter === "visible" ? base.visible : !base.visible);
      return matchesQuery && matchesFilter;
    });
  }, [articles, saved, query, filter, openId]);

  const save = async (article: PortfolioArticleWithImages, override?: Partial<ArticleForm>) => {
    const values = { ...forms[article.id], ...override };
    if (!values.title.trim()) {
      notify("A title is required before saving.", "error");
      return;
    }
    if (!DATE_RE.test(values.date) && values.date !== "N/A") {
      notify("Use the YYYY-MM-DD format for the date.", "error");
      return;
    }

    setSaving(article.id);
    try {
      const res = await fetch("/api/portfolio/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: article.id, folderName: article.folderName, ...values }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) throw new Error(data?.error || "Could not save the article");
      setForms((prev) => ({ ...prev, [article.id]: values }));
      setSaved((prev) => ({ ...prev, [article.id]: values }));
      notify(`“${values.title}” saved`);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save the article", "error");
    } finally {
      setSaving(null);
    }
  };

  const liveCount = articles.filter((a) => saved[a.id].visible).length;

  return (
    <>
      <SectionHead
        eyebrow="media library · portfolio"
        title="Articles"
        description={`Folders under Media/Portfolio, picked up automatically. ${liveCount} of ${articles.length} are visible in the sheet index.`}
      />

      {articles.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={26} />}
          title="No portfolio folders found"
          body="Drop a folder into Media/Portfolio named like Project_2026_02_11 and it shows up here with its images on the next load."
        />
      ) : (
        <>
          <div className={s.toolbar}>
            <div className={s.toolbarRow}>
              <SearchBox value={query} onChange={setQuery} placeholder="Search title or folder…" />
              <Segment
                value={filter}
                options={FILTERS}
                onChange={setFilter}
                ariaLabel="Filter articles"
              />
            </div>
          </div>

          {visibleList.length === 0 ? (
            <EmptyState
              icon={<FolderOpen size={26} />}
              title="Nothing matches those filters"
              body="Clear the search or switch back to All to see every folder again."
            >
              <button
                type="button"
                className={s.btn}
                onClick={() => {
                  setQuery("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            </EmptyState>
          ) : (
            <div className={s.rows}>
              {visibleList.map((article) => {
                const form = forms[article.id];
                const base = saved[article.id];
                const open = openId === article.id;
                const busy = saving === article.id;
                const dirty =
                  form.title !== base.title ||
                  form.date !== base.date ||
                  form.description !== base.description ||
                  form.visible !== base.visible ||
                  form.category !== base.category;
                const cover = article.images[0]
                  ? `/api/portfolio/media/${article.folderName}/${article.images[0]}?w=200`
                  : null;

                return (
                  <div
                    key={article.id}
                    className={`${s.row} ${open ? s.rowOpen : ""} ${form.visible ? "" : s.rowDim}`}
                  >
                    <div className={s.rowHead}>
                      <button
                        type="button"
                        className={s.rowHeadMain}
                        aria-expanded={open}
                        onClick={() => setOpenId(open ? null : article.id)}
                      >
                        <span className={s.rowThumb}>
                          {cover ? (
                            <Image
                              src={cover}
                              alt=""
                              fill
                              sizes="46px"
                              className={s.rowThumbImg}
                              unoptimized
                            />
                          ) : (
                            <span className={s.rowThumbEmpty}>—</span>
                          )}
                        </span>
                        <span className={s.rowMain}>
                          <span className={s.rowTitle}>{form.title || article.folderName}</span>
                          <span className={s.rowFolder}>{article.folderName}</span>
                        </span>
                      </button>

                      <div className={s.rowFlags}>
                        {dirty && <span className={`${s.badge} ${s.badgeAmber}`}>Unsaved</span>}
                        <span className={s.badge}>{form.date}</span>
                        <span className={s.badge}>{articleCategoryLabel(form.category)}</span>
                        <span className={s.badge}>
                          <Images size={10} /> {article.images.length}
                        </span>
                        <button
                          type="button"
                          className={`${s.pill} ${form.visible ? s.pillLive : s.pillHidden}`}
                          disabled={busy}
                          onClick={() => save(article, { visible: !form.visible })}
                          title={form.visible ? "Hide from the sheet index" : "Show in the sheet index"}
                        >
                          {busy ? <Spinner size={11} /> : <span className={s.pillDot} />}
                          {form.visible ? "Visible" : "Hidden"}
                        </button>
                        <button
                          type="button"
                          className={s.iconBtn}
                          aria-label={open ? "Collapse" : "Expand"}
                          onClick={() => setOpenId(open ? null : article.id)}
                        >
                          <ChevronDown
                            size={15}
                            style={{ transform: open ? "rotate(180deg)" : undefined }}
                          />
                        </button>
                      </div>
                    </div>

                    {open && (
                      <div className={`${s.rowBody} ${s.rowBodyTop}`}>
                        <div className={s.grid3}>
                          <Field label="Title">
                            <input
                              className={s.input}
                              value={form.title}
                              onChange={(e) => set(article.id, { title: e.target.value })}
                            />
                          </Field>
                          <Field label="Date" hint="YYYY-MM-DD">
                            <input
                              className={`${s.input} ${s.inputMono} ${
                                DATE_RE.test(form.date) || form.date === "N/A" ? "" : s.inputInvalid
                              }`}
                              value={form.date}
                              onChange={(e) => set(article.id, { date: e.target.value })}
                            />
                          </Field>
                          <Field label="Category">
                            <select
                              className={s.select}
                              value={form.category}
                              onChange={(e) => set(article.id, { category: e.target.value })}
                            >
                              {ARTICLE_CATEGORIES.map((c) => (
                                <option key={c.value} value={c.value}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>

                        <Field label="Description">
                          <textarea
                            className={s.textarea}
                            rows={3}
                            value={form.description}
                            onChange={(e) => set(article.id, { description: e.target.value })}
                          />
                        </Field>

                        <div className={s.rowActions}>
                          <Switch
                            checked={form.visible}
                            onChange={(v) => set(article.id, { visible: v })}
                            label="Show in the sheet index"
                          />
                          <span className={s.rowActionsSpacer} />
                          {dirty && (
                            <button
                              type="button"
                              className={`${s.btn} ${s.btnGhost} ${s.btnSm}`}
                              onClick={() => set(article.id, base)}
                            >
                              Revert
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${s.btn} ${s.btnPrimary} ${s.btnSm}`}
                            disabled={busy || !dirty}
                            onClick={() => save(article)}
                          >
                            {busy ? <Spinner /> : <Save size={14} />} Save
                          </button>
                        </div>

                        {article.images.length > 0 && (
                          <div className={s.plate}>
                            <span className={s.label}>
                              Media — {article.images.length} file
                              {article.images.length === 1 ? "" : "s"} · the first image is the cover
                            </span>
                            <div className={s.thumbs}>
                              {article.images.slice(0, 14).map((img) => (
                                <span key={img} className={s.thumb}>
                                  <Image
                                    src={`/api/portfolio/media/${article.folderName}/${img}?w=160`}
                                    alt=""
                                    fill
                                    sizes="68px"
                                    className={s.thumbImg}
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
          )}
        </>
      )}
    </>
  );
}
