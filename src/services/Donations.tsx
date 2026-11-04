import { useState } from "react";
import type { FormEvent } from "react";
import { Heart, ArrowUpRight, Check, ArrowLeft } from "lucide-react";
import { useServices } from "./context";
import { donate, money } from "./model";
import type { Donation } from "./model";
import { PageTitle, Field, Result } from "./ui";
export function DonationLanding() {
  const { act } = useServices();
  return (
    <>
      <PageTitle
        eyebrow="DONATIONS"
        title="Donate"
        description="Choose an anonymous or registered donation."
      />
      <section className="donation-intro panel">
        <Heart size={45} strokeWidth={1} />
        <h2>Support Community Services</h2>
        <p>
          Donations fund classes, transportation, home care, and event services.
        </p>
      </section>
      <div className="service-grid two">
        {[
          {
            anonymous: true,
            title: "Anonymous Donation",
            copy: "No account needed. Your donor identity is not attached to the donation.",
            button: "Donate anonymously",
          },
          {
            anonymous: false,
            title: "Registered Donation",
            copy: "Sign in and provide donor information for an on-screen sample receipt.",
            button: "Donate with an account",
          },
        ].map((x) => (
          <article className="service-card" key={x.button}>
            <span className="eyebrow">
              {x.anonymous ? "ANONYMOUS" : "REGISTERED DONOR"}
            </span>
            <h2>{x.title}</h2>
            <p>{x.copy}</p>
            <button
              className="primary"
              onClick={() => act({ type: "donation", anonymous: x.anonymous })}
            >
              {x.button}
              <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
export function Donations({
  anonymous,
  onDone,
}: {
  anonymous: boolean;
  onDone: () => void;
}) {
  const { state, user, update } = useServices();
  const [amount, setAmount] = useState("25"),
    [name, setName] = useState(user?.name || ""),
    [email, setEmail] = useState(user?.email || ""),
    [address, setAddress] = useState(user?.address || ""),
    [review, setReview] = useState(false),
    [error, setError] = useState(""),
    [result, setResult] = useState<Donation | null>(null);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      setError("Enter a positive donation amount.");
      return;
    }
    setError("");
    setReview(true);
  }
  function pay() {
    try {
      const next = donate(state, user?.id || "", Number(amount), anonymous, {
        name,
        email,
        address,
      });
      update(() => next);
      setResult(next.donations.at(-1)!);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  if (result)
    return (
      <Result title="Donation complete." onDone={onDone}>
        <p>
          Your {money(result.amount)} donation was simulated. No money was
          charged.
        </p>
        {anonymous ? (
          <p>No donor identity is attached to this donation.</p>
        ) : (
          <section className="sample-receipt">
            <span className="eyebrow">SAMPLE RECEIPT · NOT A TAX DOCUMENT</span>
            <p>{result.donor?.name}</p>
            <p>{result.donor?.email}</p>
            <p>{result.donor?.address}</p>
            <p>Reference: {result.id.slice(0, 8).toUpperCase()}</p>
            <strong>{money(result.amount)}</strong>
            <p>No email was sent.</p>
          </section>
        )}
      </Result>
    );
  return (
    <>
      <button className="text-button back-link" onClick={onDone}>
        <ArrowLeft size={15} />
        Back to donations
      </button>
      <PageTitle
        eyebrow={anonymous ? "GIVE ANONYMOUSLY" : "REGISTERED DONATION"}
        title="Donation details"
        description={
          anonymous
            ? "No account or donor identity is required."
            : "Your donor information appears on the sample receipt."
        }
      />
      <section className="panel donation-form">
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {!review ? (
          <form className="form service-form" onSubmit={submit}>
            <Field label="Donation amount">
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
            {!anonymous && (
              <>
                <Field label="Donor name">
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Field label="Donor email">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label="Mailing address">
                  <input
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </Field>
              </>
            )}
            <p className="soft-note">
              This prototype simulates donations. No real payment details are
              collected.
            </p>
            <button className="primary" type="submit">
              Review donation
              <ArrowUpRight size={16} />
            </button>
          </form>
        ) : (
          <div className="review-body">
            <h2>Review your donation</h2>
            <div className="donation-amount">{money(Number(amount))}</div>
            <p>{anonymous ? "Anonymous donation" : `${name} · ${email}`}</p>
            {!anonymous && <p>{address}</p>}
            <p className="soft-note">
              SIMULATED PAYMENT · No money will be charged.
            </p>
            <div className="form-actions">
              <button className="secondary" onClick={() => setReview(false)}>
                Edit donation
              </button>
              <button className="primary" onClick={pay}>
                Simulate payment
                <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
