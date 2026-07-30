"use client";

import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ExternalLink,
  Layers,
  Pencil,
  Plus,
  Save,
  Star,
  Trash2,
} from "lucide-react";
import {
  EmptyState,
  Field,
  Modal,
  SearchBox,
  SectionHead,
  Segment,
  Spinner,
  Switch,
  type Notify,
} from "./ui";
import { CATEGORIES, GRADIENT_PRESETS, type FlzProjectData } from "./types";
import s from "./studio.module.css";

type StatusFilter = "all" | "live" | "hidden" | "featured";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "hidden", label: "Hidden" },
  { value: "featured", label: "Featured" },
];

function blankProject(sortOrder: number): Partial<FlzProjectData> {
  return {
    title: "",
    tools: "Blender · Unity",
    category: "Characters",
    age: "Just added",
    gradient: GRADIENT_PRESETS[0].value,
    description: "",
    linkUrl: "",
    featured: false,
    visible: true,
    sortOrder,
  };
}

export function ProjectsPanel({
  projects,
  setProjects,
  notify,
}: {
  projects: FlzProjectData[];
  setProjects: Dispatch<SetStateAction<FlzProjectData[]>>;
  notify: Notify;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<Partial<FlzProjectData> | null>(null);
  const [deleting, setDeleting] = useState<FlzProjectData | null>(null);
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const [reordering, setReordering] = useState(false);

  const categories = useMemo(() => {
    const known = new Set<string>(CATEGORIES);
    for (const p of projects) known.add(p.category);
    return ["All", ...known];
  }, [projects]);

  const isFiltered = query.trim() !== "" || category !== "All" || status !== "all";

  const visibleList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQuery =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.tools.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q);
      const matchesCategory = category === "All" || p.category === category;
      const matchesStatus =
        status === "all" ||
        (status === "live" && p.visible) ||
        (status === "hidden" && !p.visible) ||
        (status === "featured" && p.featured);
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [projects, query, category, status]);

  const markPending = (id: string, on: boolean) =>
    setPending((prev) => (on ? [...prev, id] : prev.filter((x) => x !== id)));

  const patch = async (project: FlzProjectData, body: Partial<FlzProjectData>, done: string) => {
    markPending(project.id, true);
    try {
      const res = await fetch(`/api/flz/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.project) throw new Error(data?.error || "Update failed");
      // Functional update: two cards toggled in quick succession must not
      // overwrite each other with a list captured before the first response.
      setProjects((prev) => prev.map((p) => (p.id === project.id ? data.project : p)));
      notify(done);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Update failed", "error");
    } finally {
      markPending(project.id, false);
    }
  };

  /** Swap a card with its neighbour, then renumber so ties can never stall it. */
  const move = async (id: string, direction: -1 | 1) => {
    const from = projects.findIndex((p) => p.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= projects.length) return;

    const reordered = [...projects];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    const renumbered = reordered.map((p, index) => ({ ...p, sortOrder: index + 1 }));
    const changed = renumbered.filter(
      (p) => projects.find((o) => o.id === p.id)?.sortOrder !== p.sortOrder,
    );

    const previous = projects;
    setReordering(true);
    setProjects(renumbered);

    try {
      const results = await Promise.all(
        changed.map((p) =>
          fetch(`/api/flz/projects/${p.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: p.sortOrder }),
          }),
        ),
      );
      if (results.some((r) => !r.ok)) throw new Error("Could not save the new order");
      notify("Order saved");
    } catch (err) {
      setProjects(previous);
      notify(err instanceof Error ? err.message : "Could not save the new order", "error");
    } finally {
      setReordering(false);
    }
  };

  const submit = async (values: Partial<FlzProjectData>) => {
    setSaving(true);
    const isEdit = Boolean(values.id);
    try {
      const res = await fetch(
        isEdit ? `/api/flz/projects/${values.id}` : "/api/flz/projects",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
            sortOrder: values.sortOrder ?? projects.length + 1,
          }),
        },
      );
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.project) throw new Error(data?.error || "Could not save the project");

      // Re-sort so the #N badges, the reorder arrows and the public grid all
      // agree with the sortOrder that was just stored.
      setProjects((prev) =>
        (isEdit
          ? prev.map((p) => (p.id === data.project.id ? data.project : p))
          : [...prev, data.project]
        ).sort((a, b) => a.sortOrder - b.sortOrder),
      );
      setEditing(null);
      notify(isEdit ? `“${data.project.title}” updated` : `“${data.project.title}” created`);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not save the project", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (project: FlzProjectData) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/flz/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete the project");
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      setDeleting(null);
      notify(`“${project.title}” deleted`);
    } catch (err) {
      notify(err instanceof Error ? err.message : "Could not delete the project", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SectionHead
        eyebrow="flz.works · work grid"
        title="Projects"
        description="Everything in the project grid on the landing page. Order here is the order visitors see; hidden cards stay in the studio only."
      >
        <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setEditing(blankProject(projects.length + 1))}>
          <Plus size={15} strokeWidth={2.5} /> New project
        </button>
      </SectionHead>

      <div className={s.toolbar}>
        <div className={s.toolbarRow}>
          <SearchBox value={query} onChange={setQuery} placeholder="Search title, tools, description…" />
          <Segment
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
            ariaLabel="Filter by status"
          />
        </div>
        <div className={s.chipRow}>
          <span className={s.chipRowLabel}>Category</span>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              className={`${s.chip} ${category === c ? s.chipActive : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {visibleList.length === 0 ? (
        <EmptyState
          icon={<Layers size={26} />}
          title={projects.length === 0 ? "No projects yet" : "Nothing matches those filters"}
          body={
            projects.length === 0
              ? "Add your first project and it appears in the grid on flz.works right away."
              : "Try a different category or clear the filters to see the whole grid again."
          }
        >
          {isFiltered && (
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                setQuery("");
                setCategory("All");
                setStatus("all");
              }}
            >
              Clear filters
            </button>
          )}
          <button type="button" className={`${s.btn} ${s.btnPrimary}`} onClick={() => setEditing(blankProject(projects.length + 1))}>
            <Plus size={15} strokeWidth={2.5} /> New project
          </button>
        </EmptyState>
      ) : (
        <div className={s.grid}>
          {visibleList.map((p) => {
            const index = projects.findIndex((o) => o.id === p.id);
            const busy = pending.includes(p.id);
            return (
              <article key={p.id} className={`${s.card} ${p.visible ? "" : s.cardDim}`}>
                <div className={s.cardBand}>
                  <div className={s.cardBandFill} style={{ background: p.gradient || "none" }} />
                  <div className={s.cardBandTop}>
                    <span className={s.cardOrder}>#{index + 1}</span>
                    {p.featured && (
                      <span className={`${s.badge} ${s.badgeAmber}`}>
                        <Star size={9} fill="currentColor" /> Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className={s.cardBody}>
                  <h3 className={s.cardTitle}>{p.title}</h3>
                  <div className={s.cardMeta}>
                    {p.category}
                    {p.age ? ` · ${p.age}` : ""} · {p.tools}
                  </div>
                  {p.description && <p className={s.cardDesc}>{p.description}</p>}
                  {p.linkUrl && (
                    <a
                      className={s.cardLink}
                      href={p.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={11} /> {p.linkUrl}
                    </a>
                  )}
                </div>

                <div className={s.cardFoot}>
                  <button
                    type="button"
                    className={`${s.pill} ${p.visible ? s.pillLive : s.pillHidden}`}
                    disabled={busy}
                    onClick={() =>
                      patch(
                        p,
                        { visible: !p.visible },
                        p.visible ? `“${p.title}” hidden` : `“${p.title}” is live`,
                      )
                    }
                    title={p.visible ? "Hide from flz.works" : "Show on flz.works"}
                  >
                    {busy ? <Spinner size={11} /> : <span className={s.pillDot} />}
                    {p.visible ? "Live" : "Hidden"}
                  </button>

                  <button
                    type="button"
                    className={`${s.iconBtn} ${p.featured ? s.iconBtnOn : ""}`}
                    disabled={busy}
                    onClick={() =>
                      patch(
                        p,
                        { featured: !p.featured },
                        p.featured ? "Removed from featured" : `“${p.title}” is featured`,
                      )
                    }
                    aria-pressed={p.featured}
                    aria-label={p.featured ? "Remove featured flag" : "Mark as featured"}
                    title={p.featured ? "Remove featured flag" : "Mark as featured"}
                  >
                    <Star size={14} fill={p.featured ? "currentColor" : "none"} />
                  </button>

                  <span className={s.cardFootSpacer} />

                  <button
                    type="button"
                    className={s.iconBtn}
                    disabled={isFiltered || reordering || index === 0}
                    onClick={() => move(p.id, -1)}
                    aria-label="Move up"
                    title={isFiltered ? "Clear filters to reorder" : "Move up"}
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    className={s.iconBtn}
                    disabled={isFiltered || reordering || index === projects.length - 1}
                    onClick={() => move(p.id, 1)}
                    aria-label="Move down"
                    title={isFiltered ? "Clear filters to reorder" : "Move down"}
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    className={s.iconBtn}
                    onClick={() => setEditing(p)}
                    aria-label={`Edit ${p.title}`}
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className={`${s.iconBtn} ${s.iconBtnDanger}`}
                    onClick={() => setDeleting(p)}
                    aria-label={`Delete ${p.title}`}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {editing && (
        <ProjectDialog
          initial={editing}
          categories={categories.filter((c) => c !== "All")}
          saving={saving}
          onClose={() => setEditing(null)}
          onSubmit={submit}
        />
      )}

      {deleting && (
        <Modal
          title="Delete project"
          narrow
          onClose={() => setDeleting(null)}
          footer={
            <>
              <span className={s.modalFootSpacer} />
              <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={() => setDeleting(null)}>
                Cancel
              </button>
              <button
                type="button"
                className={`${s.btn} ${s.btnDanger}`}
                disabled={saving}
                onClick={() => remove(deleting)}
              >
                {saving ? <Spinner /> : <Trash2 size={15} />} Delete
              </button>
            </>
          }
        >
          <p className={s.modalText}>
            <strong>{deleting.title}</strong> will be removed from the studio and from flz.works.
            This cannot be undone.
          </p>
          <p className={s.modalText}>
            To take it off the site without losing it, close this and switch the card to{" "}
            <strong>Hidden</strong> instead.
          </p>
        </Modal>
      )}
    </>
  );
}

/* ── Create / edit dialog ───────────────────────────────────────────────── */

function ProjectDialog({
  initial,
  categories,
  saving,
  onClose,
  onSubmit,
}: {
  initial: Partial<FlzProjectData>;
  categories: string[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (values: Partial<FlzProjectData>) => void;
}) {
  const [form, setForm] = useState<Partial<FlzProjectData>>(initial);
  const [touched, setTouched] = useState(false);
  const [customGradient, setCustomGradient] = useState(
    Boolean(form.gradient) && !GRADIENT_PRESETS.some((g) => g.value === form.gradient),
  );

  const set = <K extends keyof FlzProjectData>(key: K, value: FlzProjectData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const errors = {
    title: form.title?.trim() ? "" : "A title is required.",
    tools: form.tools?.trim() ? "" : "Name at least one tool.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = () => {
    setTouched(true);
    if (hasErrors) return;
    onSubmit({
      ...form,
      title: form.title?.trim(),
      tools: form.tools?.trim(),
      age: form.age?.trim() || null,
      description: form.description?.trim() || null,
      linkUrl: form.linkUrl?.trim() || null,
      sortOrder: form.sortOrder ?? initial.sortOrder,
    });
  };

  return (
    <Modal
      title={initial.id ? "Edit project" : "New project"}
      onClose={onClose}
      footer={
        <>
          <span className={s.helper}>
            {form.visible === false ? "Saved as hidden" : "Visible on flz.works"}
          </span>
          <span className={s.modalFootSpacer} />
          <button type="button" className={`${s.btn} ${s.btnGhost}`} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`${s.btn} ${s.btnPrimary}`}
            disabled={saving}
            onClick={submit}
          >
            {saving ? <Spinner /> : <Save size={15} />} Save project
          </button>
        </>
      }
    >
      <div className={s.modalGroup}>
        <div className={s.groupLabel}>Basics</div>
        <Field label="Title" required error={touched ? errors.title : ""}>
          <input
            className={`${s.input} ${touched && errors.title ? s.inputInvalid : ""}`}
            value={form.title ?? ""}
            placeholder="Ronin — stylized swordsman"
            onChange={(e) => set("title", e.target.value)}
          />
        </Field>

        <div className={s.grid2}>
          <Field
            label="Tools"
            required
            hint="Shown above the card title."
            error={touched ? errors.tools : ""}
          >
            <input
              className={`${s.input} ${touched && errors.tools ? s.inputInvalid : ""}`}
              value={form.tools ?? ""}
              placeholder="Blender · ZBrush"
              onChange={(e) => set("tools", e.target.value)}
            />
          </Field>
          <Field label="Category" required>
            <select
              className={s.select}
              value={form.category ?? categories[0]}
              onChange={(e) => set("category", e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className={s.grid2}>
          <Field label="Time label" hint="Free text, e.g. “2 days ago”.">
            <input
              className={s.input}
              value={form.age ?? ""}
              placeholder="2 weeks ago"
              onChange={(e) => set("age", e.target.value)}
            />
          </Field>
          <Field label="Sort order" hint="Lower shows first. Arrows in the grid do this too.">
            <input
              type="number"
              className={`${s.input} ${s.inputMono}`}
              value={form.sortOrder ?? ""}
              onChange={(e) => {
                // An emptied field means "leave it alone", not "pin to the front".
                const next = Number.parseInt(e.target.value, 10);
                setForm((prev) => ({
                  ...prev,
                  sortOrder: Number.isNaN(next) ? undefined : next,
                }));
              }}
            />
          </Field>
        </div>
      </div>

      <div className={s.modalGroup}>
        <div className={s.groupLabel}>Card wash</div>
        <div className={s.swatchGrid}>
          {GRADIENT_PRESETS.map((preset) => {
            const active = form.gradient === preset.value;
            return (
              <button
                key={preset.label}
                type="button"
                className={`${s.swatch} ${active ? s.swatchActive : ""}`}
                aria-pressed={active}
                onClick={() => {
                  set("gradient", preset.value);
                  setCustomGradient(false);
                }}
              >
                <span className={s.swatchFill} style={{ background: preset.value }} />
                {active && (
                  <span className={s.swatchCheck}>
                    <Check size={13} strokeWidth={3} />
                  </span>
                )}
                <span className={s.swatchName}>{preset.label}</span>
              </button>
            );
          })}
        </div>
        <Switch
          checked={customGradient}
          onChange={setCustomGradient}
          label="Custom CSS background"
          hint="Paste any CSS background value instead of a preset."
        />
        {customGradient && (
          <Field label="CSS background">
            <input
              className={`${s.input} ${s.inputMono}`}
              value={form.gradient ?? ""}
              placeholder="radial-gradient(…)"
              onChange={(e) => set("gradient", e.target.value)}
            />
          </Field>
        )}
      </div>

      <div className={s.modalGroup}>
        <div className={s.groupLabel}>Details</div>
        <Field
          label="Description"
          hint="Short breakdown — poly count, shader notes, what to look at."
          counter={`${(form.description ?? "").length}/2000`}
        >
          <textarea
            className={s.textarea}
            rows={4}
            value={form.description ?? ""}
            maxLength={2000}
            placeholder="Hand-painted, 24k tris, game-ready character from block-out to pose."
            onChange={(e) => set("description", e.target.value)}
          />
        </Field>
        <Field label="Link" hint="Opens when a visitor clicks the card on flz.works.">
          <input
            className={`${s.input} ${s.inputMono}`}
            value={form.linkUrl ?? ""}
            placeholder="https://sketchfab.com/…"
            onChange={(e) => set("linkUrl", e.target.value)}
          />
        </Field>
      </div>

      <div className={s.modalGroup}>
        <div className={s.groupLabel}>Publishing</div>
        <Switch
          checked={form.visible ?? true}
          onChange={(v) => set("visible", v)}
          label="Visible on flz.works"
          hint="Off keeps the card in the studio only."
        />
        <Switch
          checked={form.featured ?? false}
          onChange={(v) => set("featured", v)}
          label="Featured"
          hint="Flags the project as the current highlight."
        />
      </div>
    </Modal>
  );
}
