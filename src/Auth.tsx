import { useState } from "react";
import type { FormEvent } from "react";
import { Leaf, ArrowUpRight, LockKeyhole } from "lucide-react";
import { seed } from "./model";
import type { User } from "./model";

import { useApp } from "./context";
import { Field, NeighborhoodOptions } from "./ui";
import { NeighborhoodArt } from "./Feed";

export function Auth({
  onLogin,
  onRegister,
}: {
  onLogin: (id: string) => void;
  onRegister: (u: User) => void;
}) {
  const { s, notify } = useApp();
  const [mode, setMode] = useState("login"),
    [error, setError] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      email = String(f.get("email")).toLowerCase();
    if (mode === "recovery") {
      notify("Recovery email simulated");
      setError("Recovery email simulated. No real email was sent.");
      return;
    }
    if (mode === "register") {
      if (s.users.some((u) => u.email === email)) {
        setError("An account with this email already exists");
        return;
      }
      const template = seed().users[3];
      onRegister({
        ...template,
        id: crypto.randomUUID(),
        name: String(f.get("name")).trim(),
        email,
        password: String(f.get("password")),
        address: String(f.get("address")),
        neighborhood: String(f.get("neighborhood")),
        points: 0,
        completed: 0,
        categoryCounts: {},
        groups: [],
      });
      return;
    }
    const user = s.users.find(
      (u) => u.email === email && u.password === String(f.get("password")),
    );
    if (user) onLogin(user.id);
    else setError("Email or password doesn’t match a demo account.");
  };
  return (
    <div className="auth-screen">
      <div className="auth-story">
        <a className="brand" href="#">
          <span className="brand-mark">
            <Leaf size={25} />
          </span>
          neighborly.
        </a>
        <h1>
          A little help.
          <br />A lot more
          <br />
          <em>belonging.</em>
        </h1>
        <p>
          Good neighbors make a great neighborhood.
          <br />
          Find your little corner of Ames.
        </p>
        <NeighborhoodArt />
        <span className="eyebrow">BUILT ON KINDNESS. ROOTED IN AMES.</span>
      </div>
      <section className="auth-form">
        <span className="eyebrow">YOUR COMMUNITY IS RIGHT HERE</span>
        <h1>
          {mode === "register"
            ? "Make yourself at home."
            : mode === "recovery"
              ? "Let’s get you back in."
              : "Good to see you, neighbor."}
        </h1>
        <p className="muted">
          {mode === "register"
            ? "A few details, and you’re one step closer to your community."
            : "A warm welcome to your neighborhood."}
        </p>
        <form className="form" onSubmit={submit}>
          {error && (
            <p className="form-error" role="alert">
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
              placeholder="maya@example.test"
            />
          </Field>
          {mode !== "recovery" && (
            <Field label="Password">
              <input
                name="password"
                type="password"
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
              <Field label="Neighborhood">
                <select name="neighborhood">
                  <NeighborhoodOptions />
                </select>
              </Field>
              <Field label="Private address">
                <input name="address" required />
              </Field>
              <p className="private-note">
                <LockKeyhole size={15} />
                Private, self-declared residency. A moderator reviews your
                membership.
              </p>
              <label className="check-row">
                <input type="checkbox" required />I agree to keep it local,
                free, and neighborly.
              </label>
            </>
          )}
          <button className="primary" type="submit">
            {mode === "register"
              ? "Create account"
              : mode === "recovery"
                ? "Send recovery link"
                : "Log in"}
            <ArrowUpRight size={16} />
          </button>
        </form>
        {mode === "login" && (
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
        <button
          className="secondary auth-switch"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
        >
          {mode === "login" ? "Create an account" : "Back to log in"}
        </button>
        <div className="demo-credentials">
          <span className="eyebrow">TAKE A LOOK AROUND</span>
          <p>
            This is a frontend prototype. Use <strong>maya@example.test</strong>{" "}
            / <strong>neighborly</strong> or enter a demo account below.
          </p>
          <button className="text-button" onClick={() => onLogin("maya")}>
            Continue as Maya <ArrowUpRight size={15} />
          </button>
        </div>
      </section>
    </div>
  );
}
