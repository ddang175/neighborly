import { useState } from "react";
import type { FormEvent } from "react";
import { Leaf, ArrowUpRight, ArrowLeft, LockKeyhole } from "lucide-react";
import type { User, VolunteerActivity } from "./services/model";
import { useServices } from "./services/context";
import { Field, CenterArt } from "./services/ui";
export function Auth({
  onLogin,
  onRegister,
  onCancel,
  admin = false,
}: {
  onLogin: (id: string) => void;
  onRegister: (u: User) => void;
  onCancel: () => void;
  admin?: boolean;
}) {
  const { state } = useServices();
  const [mode, setMode] = useState<"login" | "register" | "recovery">("login"),
    [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      email = String(f.get("email")).trim().toLowerCase();
    setError("");
    if (mode === "recovery") {
      setError("Recovery email simulated. No real email was sent.");
      return;
    }
    if (mode === "register") {
      if (state.users.some((u) => u.email === email)) {
        setError("An account with this email already exists.");
        return;
      }
      const name = String(f.get("name")).trim(),
        address = String(f.get("address")).trim();
      if (!name || !address) {
        setError("Enter your name and address.");
        return;
      }
      onRegister({
        id: crypto.randomUUID(),
        name,
        email,
        address,
        password: String(f.get("password")),
        activities: f.getAll("activities") as VolunteerActivity[],
      });
      return;
    }
    const u = state.users.find(
      (u) => u.email === email && u.password === String(f.get("password")),
    );
    if (u && (!admin || u.admin)) onLogin(u.id);
    else
      setError(
        admin
          ? "Use the mock admin account shown below."
          : "Email or password doesn’t match a demo account.",
      );
  }
  return (
    <div className="auth-screen">
      <div className="auth-story">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onCancel();
          }}
        >
          <span className="brand-mark">
            <Leaf size={25} />
          </span>
          <span className="brand-name">Best Community Service.</span>
        </a>
        <h1>
          Community
          <br />
          <em>services.</em>
        </h1>
        <p>Rooms, classes, transportation, and home care.</p>
        <CenterArt />
        <span className="eyebrow">AMES, IOWA</span>
      </div>
      <section className="auth-form">
        <button className="text-button" onClick={onCancel}>
          <ArrowLeft size={14} />
          Back to browsing
        </button>
        <span className="eyebrow">
          {admin ? "MOCK ADMIN · PROTOTYPE ONLY" : "ACCOUNT ACCESS"}
        </span>
        <h1>
          {mode === "register"
            ? "Create an account"
            : mode === "recovery"
              ? "Reset your password"
              : "Log in"}
        </h1>
        <p className="muted">
          {admin
            ? "Sign in to review class submissions and sample prices."
            : "Sign in to book services or volunteer."}
        </p>
        <form className="form" onSubmit={submit}>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {mode === "register" && (
            <Field label="Full name">
              <input name="name" autoComplete="name" required />
            </Field>
          )}
          <Field label="Email">
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder={admin ? "admin@example.test" : "maya@example.test"}
            />
          </Field>
          {mode !== "recovery" && (
            <Field label="Password">
              <input
                type="password"
                name="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                required
                minLength={mode === "register" ? 8 : 1}
              />
            </Field>
          )}
          {mode === "register" && (
            <>
              <Field label="Mailing address">
                <input name="address" autoComplete="street-address" required />
              </Field>
              <fieldset className="choice-fieldset">
                <legend>Volunteer interests (optional · choose any)</legend>
                {(
                  ["Teach", "Drive", "Give Home Care"] as VolunteerActivity[]
                ).map((v) => (
                  <label className="check-row" key={v}>
                    <input name="activities" type="checkbox" value={v} />
                    {v}
                  </label>
                ))}
              </fieldset>
              <p className="private-note">
                <LockKeyhole size={15} />
                Use fictional details. Accounts exist only for this browser
                session.
              </p>
            </>
          )}
          <button type="submit" className="primary">
            {mode === "register"
              ? "Create account"
              : mode === "recovery"
                ? "Send recovery link"
                : "Log in"}
            <ArrowUpRight size={16} />
          </button>
        </form>
        {mode === "login" && !admin && (
          <button
            className="text-button"
            onClick={() => {
              setMode("recovery");
              setError("");
            }}
          >
            Forgot password?
          </button>
        )}
        {!admin && (
          <button
            className="secondary auth-switch"
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create an account" : "Back to log in"}
          </button>
        )}
        <div className="demo-credentials">
          <span className="eyebrow">DEMO ACCOUNT</span>
          <p>
            Simulated account:{" "}
            <strong>
              {admin ? "admin@example.test" : "maya@example.test"}
            </strong>{" "}
            / <strong>neighborly</strong>. No real authentication or email.
          </p>
          <button
            className="text-button"
            onClick={() => onLogin(admin ? "admin" : "maya")}
          >
            {admin ? "Continue as Demo Admin" : "Continue as Maya"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
