"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Loader2, Search, X } from "lucide-react";
import s from "./studio.module.css";

/* ── Toasts ─────────────────────────────────────────────────────────────── */

export type ToastKind = "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  kind: ToastKind;
}

/** Signature every panel receives so it can report the outcome of a save. */
export type Notify = (message: string, kind?: ToastKind) => void;

export function ToastStack({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div className={s.toastWrap} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${s.toast} ${t.kind === "success" ? s.toastSuccess : s.toastError}`}
          role="status"
        >
          <span className={t.kind === "success" ? s.toastIconOk : s.toastIconErr}>
            {t.kind === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
          </span>
          <span className={s.toastMsg}>{t.message}</span>
          <button
            type="button"
            className={s.toastClose}
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Section & panel chrome ─────────────────────────────────────────────── */

export function SectionHead({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.sectionHead}>
      <div className={s.sectionHeadText}>
        {eyebrow && <div className={s.sectionEyebrow}>{eyebrow}</div>}
        <h1 className={s.sectionTitle}>{title}</h1>
        {description && <p className={s.sectionDesc}>{description}</p>}
      </div>
      {children && <div className={s.sectionActions}>{children}</div>}
    </div>
  );
}

export function Panel({
  icon,
  title,
  right,
  children,
}: {
  icon?: ReactNode;
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={s.panel}>
      <div className={s.panelHead}>
        {icon && <span className={s.panelHeadIcon}>{icon}</span>}
        <h2 className={s.panelTitle}>{title}</h2>
        {right && <div className={s.panelHeadRight}>{right}</div>}
      </div>
      <div className={s.panelBody}>{children}</div>
    </section>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  children?: ReactNode;
}) {
  return (
    <div className={s.empty}>
      <span className={s.emptyIcon}>{icon}</span>
      <h3 className={s.emptyTitle}>{title}</h3>
      <p className={s.emptyBody}>{body}</p>
      {children && <div className={s.emptyActions}>{children}</div>}
    </div>
  );
}

/* ── Inputs ─────────────────────────────────────────────────────────────── */

export function Field({
  label,
  required,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  counter?: string;
  children: ReactNode;
}) {
  return (
    <label className={s.field}>
      <span className={s.fieldRow}>
        <span className={s.label}>
          {label}
          {required && <span className={s.labelReq}>*</span>}
        </span>
        {counter && <span className={s.counter}>{counter}</span>}
      </span>
      {children}
      {error ? (
        <span className={`${s.helper} ${s.helperError}`}>{error}</span>
      ) : hint ? (
        <span className={s.helper}>{hint}</span>
      ) : null}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <div className={s.switchRow}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`${s.switch} ${checked ? s.switchOn : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span className={s.switchKnob} />
      </button>
      <span className={s.switchText}>
        <span className={s.switchLabel}>{label}</span>
        {hint && <span className={s.switchHint}>{hint}</span>}
      </span>
    </div>
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
}) {
  return (
    <div className={s.search}>
      <Search size={15} />
      <input
        type="search"
        className={s.searchInput}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className={s.searchClear}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

export function Segment<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div className={s.segment} role="group" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={`${s.segmentBtn} ${value === o.value ? s.segmentBtnActive : ""}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ── Modal ──────────────────────────────────────────────────────────────── */

export function Modal({
  title,
  onClose,
  narrow,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  narrow?: boolean;
  footer: ReactNode;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  // Escape to close, and keep the page behind from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  // Move focus into the dialog, and hand it back to the trigger on close.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const first = bodyRef.current?.querySelector<HTMLElement>(
      "input:not([type=hidden]), textarea, select, button",
    );
    first?.focus();
    return () => opener?.focus?.();
  }, []);

  return (
    <div className={s.backdrop} onClick={onClose}>
      <div
        className={`${s.modal} ${narrow ? s.modalNarrow : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.modalHead}>
          <h2 className={s.modalTitle}>{title}</h2>
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>
        <div className={s.modalBody} ref={bodyRef}>
          {children}
        </div>
        <div className={s.modalFoot}>{footer}</div>
      </div>
    </div>
  );
}

/* ── Misc ───────────────────────────────────────────────────────────────── */

export function Spinner({ size = 15 }: { size?: number }) {
  return <Loader2 size={size} className={s.spin} />;
}

export { s as studio };
