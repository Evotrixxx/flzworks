"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
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
  return (
    <div className={s.toastWrap} aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${s.toast} ${t.kind === "success" ? s.toastSuccess : s.toastError}`}
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
  const generatedId = useId();
  const controlId = `studio-field-${generatedId}`;
  const helperId = `${controlId}-help`;
  const counterId = `${controlId}-count`;
  type ControlProps = {
    id?: string;
    required?: boolean;
    "aria-required"?: boolean;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  };
  const element = isValidElement(children) ? (children as ReactElement<ControlProps>) : null;
  const isControl =
    element &&
    typeof element.type === "string" &&
    ["input", "textarea", "select"].includes(element.type);
  const describedBy = [counter ? counterId : "", error || hint ? helperId : ""]
    .filter(Boolean)
    .join(" ");
  const control = isControl
    ? cloneElement(element, {
        id: element.props.id ?? controlId,
        required,
        "aria-required": required || undefined,
        "aria-invalid": Boolean(error) || undefined,
        "aria-describedby": describedBy || undefined,
      })
    : children;

  return (
    <div className={s.field}>
      <span className={s.fieldRow}>
        <label className={s.label} htmlFor={isControl ? element.props.id ?? controlId : undefined}>
          {label}
          {required && <span className={s.labelReq}>*</span>}
        </label>
        {counter && <span className={s.counter} id={counterId}>{counter}</span>}
      </span>
      {control}
      {error ? (
        <span className={`${s.helper} ${s.helperError}`} id={helperId} role="alert">{error}</span>
      ) : hint ? (
        <span className={s.helper} id={helperId}>{hint}</span>
      ) : null}
    </div>
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
  confirmCloseMessage,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  narrow?: boolean;
  confirmCloseMessage?: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef(onClose);
  const confirmCloseRef = useRef(confirmCloseMessage);
  const backdropPressed = useRef(false);
  const titleId = useId();

  useEffect(() => {
    closeRef.current = onClose;
    confirmCloseRef.current = confirmCloseMessage;
  }, [onClose, confirmCloseMessage]);

  const requestIncidentalClose = useCallback(() => {
    const message = confirmCloseRef.current;
    if (!message || window.confirm(message)) closeRef.current();
  }, []);

  // Trap focus, support Escape, keep the page behind from scrolling, and
  // restore focus to the control that opened the dialog.
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const dialog = dialogRef.current;
    const bodyFirst = dialog
      ?.querySelector<HTMLElement>("[data-modal-body]")
      ?.querySelector<HTMLElement>(focusableSelector);
    (bodyFirst ?? dialog?.querySelector<HTMLElement>(focusableSelector))?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        requestIncidentalClose();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) {
        e.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
      openerRef.current?.focus?.();
    };
  }, [requestIncidentalClose]);

  return (
    <div
      className={s.backdrop}
      onMouseDown={(e) => {
        backdropPressed.current = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (backdropPressed.current && e.target === e.currentTarget) requestIncidentalClose();
        backdropPressed.current = false;
      }}
    >
      <div
        ref={dialogRef}
        className={`${s.modal} ${narrow ? s.modalNarrow : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.modalHead}>
          <h2 className={s.modalTitle} id={titleId}>{title}</h2>
          <button type="button" className={s.iconBtn} onClick={onClose} aria-label="Close dialog">
            <X size={16} />
          </button>
        </div>
        <div className={s.modalBody} data-modal-body>
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
