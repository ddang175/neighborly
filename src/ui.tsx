import { useEffect, useId, cloneElement } from "react";
import type { ReactNode, ReactElement } from "react";
import { X, Sprout } from "lucide-react";

import type { User } from "./model";

import { useApp } from "./context";

const initials = (name: string) =>
  name
    .split(" ")
    .map((v) => v[0])
    .slice(0, 2)
    .join("");
export function Avatar({ user, size = "" }: { user: User; size?: string }) {
  return (
    <span className={`avatar ${user.id} ${size}`}>{initials(user.name)}</span>
  );
}

export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Sprout size={38} />
      <h3>{title}</h3>
      <p>
        {children || "Good things start with a little neighborly kindness."}
      </p>
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const nodes = Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"] button:not(:disabled),[role="dialog"] input,[role="dialog"] select,[role="dialog"] textarea,[role="dialog"] a',
          ),
        );
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    document.body.style.overflow = "hidden";
    setTimeout(
      () =>
        document.querySelector<HTMLElement>('[role="dialog"] button')?.focus(),
      20,
    );
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = "";
      before?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className={`modal ${wide ? "wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-head">
          <h2>{title}</h2>
          <button
            className="icon-button"
            aria-label="Close dialog"
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

export function GoTo({
  view,
  children,
}: {
  view: string;
  children: ReactNode;
}) {
  const { setView } = useApp();
  return (
    <button className="text-button" onClick={() => setView(view)}>
      {children}
    </button>
  );
}

export function NeighborhoodOptions() {
  const { s } = useApp();
  return (
    <>
      {[
        "Old Town",
        "Somerset",
        "North Ames",
        ...s.proposals
          .filter((p) => p.type === "Neighborhood" && p.status === "Approved")
          .map((p) => p.name),
      ].map((n) => (
        <option key={n}>{n}</option>
      ))}
    </>
  );
}
