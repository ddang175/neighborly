import { useEffect, useId, useRef, cloneElement } from "react";
import type { ReactNode, ReactElement } from "react";
import { X, CalendarDays, CheckCircle2, ArrowUpRight } from "lucide-react";
import { dayOffset, today } from "./model";
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        <span>{label}</span>
      </label>
      {cloneElement(children as ReactElement<{ id: string }>, { id })}
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null),
    close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
      if (e.key === "Tab") {
        const all = Array.from(
          ref.current?.querySelectorAll<HTMLElement>(
            "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]",
          ) || [],
        );
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      before?.focus();
    };
  }, []);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="modal wide"
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            aria-label="Close dialog"
            className="icon-button"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Calendar({
  dates,
  value,
  onChange,
  label = "Choose a date",
}: {
  dates: string[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
}) {
  const available = dates.filter((d) => d >= today()).sort(),
    first = available[0] || today();
  const [year, month] = first.split("-").map(Number),
    heading = new Date(year, month - 1, 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  const months = [...new Set(available.map((d) => d.slice(0, 7)))];
  return (
    <fieldset className="service-calendar">
      <legend>
        <CalendarDays size={16} />
        {label}
      </legend>
      <div className="calendar-heading">
        {heading}
        {months.length > 1 ? " & upcoming dates" : ""}
      </div>
      <div className="date-grid" role="group" aria-label={label}>
        {Array.from(
          {
            length: Math.min(
              42,
              Math.max(
                14,
                available.length
                  ? Math.round(
                      (new Date(`${available.at(-1)}T12:00`).getTime() -
                        new Date(`${first}T12:00`).getTime()) /
                        86400000,
                    ) + 1
                  : 14,
              ),
            ),
          },
          (_, i) => {
            const date = dayOffset(first, i),
              d = new Date(`${date}T12:00`);
            return (
              <button
                type="button"
                key={date}
                disabled={!available.includes(date)}
                aria-label={date}
                aria-pressed={date === value}
                className={date === value ? "selected" : ""}
                onClick={() => onChange(date)}
              >
                <small>
                  {d.toLocaleDateString("en-US", { weekday: "short" })}
                </small>
                <strong>{d.getDate()}</strong>
                <small>
                  {d.toLocaleDateString("en-US", { month: "short" })}
                </small>
              </button>
            );
          },
        )}
      </div>
      <Field label="Selected date">
        <input
          type="date"
          value={value}
          min={today()}
          onChange={(e) => onChange(e.target.value)}
          required
        />
      </Field>
      <small className="muted">
        Highlighted dates have sample availability.{" "}
        {value && !available.includes(value) ? "This date is unavailable." : ""}
      </small>
    </fieldset>
  );
}
export function Result({
  title,
  children,
  onDone,
}: {
  title: string;
  children: ReactNode;
  onDone: () => void;
}) {
  return (
    <section className="result-panel panel">
      <span className="result-icon">
        <CheckCircle2 size={38} />
      </span>
      <span className="eyebrow">BEST COMMUNITY SERVICE</span>
      <h1>{title}</h1>
      <div className="result-body">{children}</div>
      <button className="primary" onClick={onDone}>
        Back to services <ArrowUpRight size={16} />
      </button>
    </section>
  );
}
export function CenterArt() {
  return (
    <div className="center-art" aria-hidden="true">
      <div className="art-sun" />
      <div className="art-tree one" />
      <div className="art-tree two" />
      <div className="art-building">
        <span className="art-sign">COMMUNITY CENTER</span>
        <div className="art-windows">
          <i />
          <i />
          <i />
        </div>
        <div className="art-door" />
      </div>
      <div className="art-path" />
      <span className="art-flower">✳</span>
    </div>
  );
}
