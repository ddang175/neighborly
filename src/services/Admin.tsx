import { useState } from "react";
import type { FormEvent } from "react";
import { Check, Save } from "lucide-react";
import { useServices } from "./context";
import { approveClass, money } from "./model";
import { PageTitle, Field } from "./ui";
export function Admin() {
  const { state, user, update, notify } = useServices();
  const [tab, setTab] = useState<"classes" | "prices">("classes"),
    [error, setError] = useState("");
  if (!user?.admin) return <p>Mock administrator sign-in required.</p>;
  const pending = state.offerings.filter(
    (o) => o.kind === "class" && o.status === "Submitted",
  );
  function approve(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const price = Number(new FormData(e.currentTarget).get("price"));
    try {
      update((s) => approveClass(s, user!.id, id, price));
      notify("Class approved and published.");
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      prices = { ...state.prices };
    for (const key of Object.keys(prices)) {
      const value = Number(f.get(key));
      if (!Number.isFinite(value) || value < 0) {
        setError("Prices must be nonnegative numbers.");
        return;
      }
      prices[key] = Math.round(value * 100) / 100;
    }
    update((s) => ({ ...s, prices }));
    setError("");
    notify("Sample prices updated throughout the prototype.");
  }
  return (
    <>
      <PageTitle
        eyebrow="MOCK ADMIN · PROTOTYPE ONLY"
        title="Mock Admin"
        description="Review proposed classes and set sample prices. This is a client-side demonstration."
      />
      <div className="service-tabs admin-tabs">
        <button
          className={tab === "classes" ? "selected" : ""}
          onClick={() => setTab("classes")}
        >
          Class approvals <span className="count-pill">{pending.length}</span>
        </button>
        <button
          className={tab === "prices" ? "selected" : ""}
          onClick={() => setTab("prices")}
        >
          Sample pricing
        </button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {tab === "classes" ? (
        <>
          {pending.length === 0 && (
            <section className="panel empty">
              <Check size={32} />
              <h2>No classes awaiting approval.</h2>
              <p>
                New teaching submissions appear here before becoming publicly
                available.
              </p>
            </section>
          )}
          {pending.map((o) => (
            <section className="panel approval-card" key={o.id}>
              <span className="eyebrow">AWAITING APPROVAL</span>
              <h2>{o.title}</h2>
              <p>{o.description}</p>
              <dl className="detail-facts">
                <div>
                  <dt>Volunteer</dt>
                  <dd>{state.users.find((u) => u.id === o.userId)?.name}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>
                    {o.date} · {o.start}–{o.end}
                    {o.recurring
                      ? ` · Weekly through ${o.until}`
                      : " · One-time"}
                  </dd>
                </div>
                <div>
                  <dt>Course</dt>
                  <dd>
                    {o.language} · {o.level}
                  </dd>
                </div>
                <div>
                  <dt>Prerequisites</dt>
                  <dd>{o.prerequisites}</dd>
                </div>
              </dl>
              <form
                onSubmit={(e) => approve(e, o.id)}
                className="approval-actions"
              >
                <Field label={`Price per session for ${o.title}`}>
                  <input
                    type="number"
                    name="price"
                    defaultValue="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </Field>
                <button className="primary" type="submit">
                  Approve and publish
                  <Check size={16} />
                </button>
              </form>
            </section>
          ))}
        </>
      ) : (
        <section className="panel">
          <form className="form service-form" onSubmit={save}>
            <h2>Prices per posting</h2>
            <p className="muted">
              Use 0 for a free service. These are editable sample prices, not
              instructor-specified fees.
            </p>
            <div className="pricing-grid">
              {state.catalog.map((c) => (
                <Field key={c.id} label={`${c.title} · per ${c.unit}`}>
                  <input
                    name={c.id}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={state.prices[c.id]}
                    required
                  />
                </Field>
              ))}
            </div>
            <h2>Room add-ons</h2>
            <div className="pricing-grid">
              {[
                { key: "catering", label: "Catering · per person" },
                { key: "cleaning", label: "Room cleaning · per reservation" },
                { key: "table", label: "Table · each" },
                { key: "chair", label: "Chair · each" },
              ].map((x) => (
                <Field label={x.label} key={x.key}>
                  <input
                    name={x.key}
                    type="number"
                    min="0"
                    step="0.01"
                    defaultValue={state.prices[x.key]}
                    required
                  />
                </Field>
              ))}
            </div>
            <button className="primary" type="submit">
              Save sample prices
              <Save size={16} />
            </button>
            <p className="service-footnote">
              Room and equipment quantities determine the total. Example table
              price: {money(state.prices.table)} each.
            </p>
          </form>
        </section>
      )}
    </>
  );
}
