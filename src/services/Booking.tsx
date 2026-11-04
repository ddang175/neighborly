import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  ShieldCheck,
  Pencil,
} from "lucide-react";
import type {
  BookingDraft,
  BookingKind,
  CatalogItem,
  Booking as BookingRecord,
} from "./model";
import {
  isRoom,
  isClass,
  hasTrip,
  money,
  quote,
  completeBooking,
  validateBooking,
  remainingSeats,
  classSeats,
  slotAvailable,
} from "./model";
import { useServices } from "./context";
import { Calendar, Field, Modal, PageTitle, Result } from "./ui";
const titles: Record<BookingKind, string> = {
  room: "Reserve a room",
  class: "Take a class",
  shuttle: "Reserve a shuttle",
  ride: "Request a ride",
  care: "Request home care",
  "package-room": "Room + Shuttle",
  "package-class": "Classes + Shuttle",
};
export function Booking({
  kind,
  itemId,
  initialDate,
  onDone,
}: {
  kind: BookingKind;
  itemId?: string;
  initialDate?: string;
  onDone: () => void;
}) {
  const { state, user, update } = useServices();
  const baseKind =
    kind === "package-room"
      ? "room"
      : kind === "package-class"
        ? "class"
        : kind;
  const items = state.catalog.filter((c) => c.kind === baseKind),
    initial = items.find((c) => c.id === itemId) || items[0];
  const [d, setD] = useState<BookingDraft>({
    kind,
    itemId: initial.id,
    date: initialDate || initial.dates[0],
    start: initial.start,
    end:
      baseKind === "room"
        ? "11:00"
        : baseKind === "care"
          ? "10:00"
          : baseKind === "ride"
            ? undefined
            : initial.end,
    event: "",
    people: 1,
    catering: 0,
    cleaning: false,
    tables: 0,
    chairs: 0,
    passengers: 1,
    recipient: user?.name || "",
    address: user?.address || "",
    notes: "",
    pickup: "",
    destination: "",
  });
  const [step, setStep] = useState<
      "details" | "shuttle" | "review" | "payment"
    >("details"),
    [addons, setAddons] = useState(false),
    [error, setError] = useState(""),
    [reviewTotal, setReviewTotal] = useState<number | null>(null),
    [result, setResult] = useState<BookingRecord | null>(null);
  const item = state.catalog.find((c) => c.id === d.itemId)!,
    pack = kind === "package-room" || kind === "package-class";
  function change(p: Partial<BookingDraft>) {
    setD((x) => ({ ...x, ...p }));
    setError("");
  }
  function choose(c: CatalogItem) {
    change({
      itemId: c.id,
      date: c.dates[0],
      start: c.start,
      end:
        c.kind === "room"
          ? "11:00"
          : c.kind === "care"
            ? "10:00"
            : c.kind === "ride"
              ? undefined
              : c.end,
      tripId: undefined,
    });
  }
  const q = quote(state, d),
    trip = state.catalog.find((c) => c.id === d.tripId);
  function review() {
    validateBooking(state, d);
    setReviewTotal(q.total);
    setStep("review");
  }
  function advance(e: FormEvent) {
    e.preventDefault();
    try {
      if (pack && step === "details") {
        validateBooking(state, { ...d, kind: baseKind as "room" | "class" });
        const first = state.catalog.find(
          (c) =>
            c.kind === "shuttle" &&
            c.dates.includes(d.date) &&
            remainingSeats(state, c.id, d.date) > 0,
        );
        change({ tripId: first?.id, passengers: 1 });
        setStep("shuttle");
      } else review();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function finish() {
    try {
      const next = completeBooking(state, user!.id, d, reviewTotal!);
      update(() => next);
      setResult(next.bookings.at(-1)!);
    } catch (e) {
      setError((e as Error).message);
      setStep("review");
      setReviewTotal(quote(state, d).total);
    }
  }
  if (result)
    return (
      <Result
        title={
          result.status === "Request submitted"
            ? "Ride request submitted."
            : pack
              ? "Package confirmed."
              : "Reservation confirmed."
        }
        onDone={onDone}
      >
        <p>
          {item.title}
          {trip ? ` + ${trip.title}` : ""}
        </p>
        <p>
          {d.date} {d.start ? `· ${d.start}${d.end ? `–${d.end}` : ""}` : ""}
        </p>
        {hasTrip(d) && (
          <p>
            {d.passengers} shuttle passenger{d.passengers === 1 ? "" : "s"}{" "}
            reserved.
          </p>
        )}
        <p>
          Reference: <strong>{result.id.slice(0, 8).toUpperCase()}</strong>
        </p>
        <p>
          {result.total > 0
            ? `Simulated payment: ${money(result.total)}. No money was charged.`
            : "This service is free. No payment was needed."}
        </p>
        {result.status === "Request submitted" && (
          <p>
            No driver has been assigned. This is a request, not a guaranteed
            ride.
          </p>
        )}
      </Result>
    );
  const steps = pack
    ? ["Service details", "Shuttle", "Review", "Payment"]
    : ["Service details", "Review", "Payment"];
  const active =
    step === "details"
      ? 0
      : step === "shuttle"
        ? 1
        : step === "review"
          ? pack
            ? 2
            : 1
          : pack
            ? 3
            : 2;
  return (
    <>
      <button className="text-button back-link" onClick={onDone}>
        <ArrowLeft size={15} />
        Cancel and return to services
      </button>
      <PageTitle
        eyebrow={pack ? "PACKAGES" : "RESERVATION"}
        title={titles[kind]}
        description={
          pack
            ? "Choose both services, enter shared details once, and confirm together."
            : "Choose your service and availability, then review your details."
        }
      />
      <ol className="booking-progress" aria-label="Booking progress">
        {steps.map((s, i) => (
          <li
            key={s}
            aria-current={i === active ? "step" : undefined}
            className={i <= active ? "current" : ""}
          >
            <span>{i < active ? <Check size={13} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="booking-layout">
        <section className="panel booking-panel">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {(step === "details" || step === "shuttle") && (
            <form className="form service-form" onSubmit={advance}>
              {step === "details" ? (
                <>
                  <Field
                    label={
                      baseKind === "room"
                        ? "Choose room"
                        : baseKind === "class"
                          ? "Choose class"
                          : baseKind === "care"
                            ? "Choose home-care service"
                            : baseKind === "shuttle"
                              ? "Choose shuttle"
                              : "Service"
                    }
                  >
                    <select
                      value={d.itemId}
                      onChange={(e) =>
                        choose(
                          state.catalog.find((c) => c.id === e.target.value)!,
                        )
                      }
                    >
                      {items.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <p className="soft-note">
                    {item.description} · {money(state.prices[item.id])} /{" "}
                    {item.unit}
                  </p>
                  <Calendar
                    dates={item.dates.filter((date) =>
                      baseKind === "class"
                        ? classSeats(state, item.id, date) > 0
                        : baseKind === "shuttle"
                          ? remainingSeats(state, item.id, date) > 0
                          : true,
                    )}
                    value={d.date}
                    onChange={(date) => change({ date, tripId: undefined })}
                  />
                  {baseKind === "class" ? (
                    <>
                      <div className="soft-note">
                        <strong>
                          {item.start}–{item.end} · {item.location}
                        </strong>
                        <p>
                          {item.language} · {item.level} · Prerequisites:{" "}
                          {item.prerequisites}
                        </p>
                        <p>
                          {classSeats(state, item.id, d.date)} places available.
                          Reserve one dated session.
                        </p>
                      </div>
                    </>
                  ) : baseKind === "shuttle" ? (
                    <>
                      <div className="soft-note">
                        <strong>
                          Departure {item.start} · Arrival {item.end}
                        </strong>
                        <p>
                          {remainingSeats(state, item.id, d.date)} seats
                          available.
                        </p>
                      </div>
                      <Field label="Passengers">
                        <input
                          type="number"
                          min="1"
                          max={remainingSeats(state, item.id, d.date)}
                          step="1"
                          required
                          value={d.passengers}
                          onChange={(e) =>
                            change({ passengers: Number(e.target.value) })
                          }
                        />
                      </Field>
                    </>
                  ) : (
                    <>
                      <div className="form-grid">
                        <Field
                          label={
                            baseKind === "ride" ? "Pickup time" : "Start time"
                          }
                        >
                          <input
                            type="time"
                            min={item.start}
                            max={item.end}
                            required
                            value={d.start}
                            onChange={(e) => change({ start: e.target.value })}
                          />
                        </Field>
                        {baseKind !== "ride" && (
                          <Field label="End time">
                            <input
                              type="time"
                              min={d.start}
                              max={item.end}
                              required
                              value={d.end}
                              onChange={(e) => change({ end: e.target.value })}
                            />
                          </Field>
                        )}
                      </div>
                      {(baseKind === "room" || baseKind === "care") && (
                        <div className="slot-options">
                          <small>Sample quick-select times</small>
                          <div>
                            {[
                              ["09:00", "10:00"],
                              ["10:00", "11:00"],
                              ["13:00", "14:00"],
                              ["15:00", "16:00"],
                            ].map(([start, end]) => (
                              <button
                                className={
                                  d.start === start && d.end === end
                                    ? "selected"
                                    : ""
                                }
                                type="button"
                                disabled={
                                  !slotAvailable(
                                    state,
                                    item.id,
                                    d.date,
                                    start,
                                    end,
                                  )
                                }
                                key={start}
                                onClick={() => change({ start, end })}
                              >
                                {start}–{end}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {baseKind === "room" ? (
                        <>
                          <div className="form-grid">
                            <Field label="Event name or type">
                              <input
                                required
                                value={d.event}
                                onChange={(e) =>
                                  change({ event: e.target.value })
                                }
                                placeholder="e.g. Community meeting"
                              />
                            </Field>
                            <Field label="Expected attendance">
                              <input
                                type="number"
                                min="1"
                                max={item.capacity}
                                step="1"
                                required
                                value={d.people}
                                onChange={(e) =>
                                  change({ people: Number(e.target.value) })
                                }
                              />
                            </Field>
                          </div>
                          <section className="addon-callout">
                            <div>
                              <h3>Optional add-ons</h3>
                              <p>Catering, cleaning, tables, and chairs.</p>
                            </div>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => setAddons(true)}
                            >
                              <Plus size={15} />
                              Choose add-ons
                            </button>
                          </section>
                          <p className="muted">
                            Current extras: {d.catering || 0} catered guests,{" "}
                            {d.cleaning ? "cleaning" : "no cleaning"},{" "}
                            {d.tables || 0} tables, {d.chairs || 0} chairs.
                          </p>
                        </>
                      ) : baseKind === "ride" ? (
                        <>
                          <Field label="Pickup address">
                            <input
                              required
                              value={d.pickup}
                              onChange={(e) =>
                                change({ pickup: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Destination">
                            <input
                              required
                              value={d.destination}
                              onChange={(e) =>
                                change({ destination: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Passengers">
                            <input
                              type="number"
                              min="1"
                              max="4"
                              step="1"
                              required
                              value={d.passengers}
                              onChange={(e) =>
                                change({ passengers: Number(e.target.value) })
                              }
                            />
                          </Field>
                          <p className="soft-note">
                            A volunteer ride is requested for your chosen pickup
                            time. No automatic matching or guaranteed driver is
                            simulated.
                          </p>
                        </>
                      ) : (
                        <>
                          <Field label="Recipient name">
                            <input
                              required
                              value={d.recipient}
                              onChange={(e) =>
                                change({ recipient: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Home address">
                            <input
                              required
                              value={d.address}
                              onChange={(e) =>
                                change({ address: e.target.value })
                              }
                            />
                          </Field>
                          <Field label="Assistance needed">
                            <textarea
                              rows={3}
                              required
                              value={d.notes}
                              onChange={(e) =>
                                change({ notes: e.target.value })
                              }
                            />
                          </Field>
                        </>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <h2>Select your shuttle</h2>
                  <p className="muted">
                    For {d.date}. Choose the route and time suitable for your{" "}
                    {baseKind === "room" ? "event" : "class"}.
                  </p>
                  {state.catalog
                    .filter(
                      (c) => c.kind === "shuttle" && c.dates.includes(d.date),
                    )
                    .map((c) => (
                      <label
                        className={`trip-option ${d.tripId === c.id ? "selected" : ""}`}
                        key={c.id}
                      >
                        <input
                          type="radio"
                          name="trip"
                          required
                          checked={d.tripId === c.id}
                          disabled={remainingSeats(state, c.id, d.date) <= 0}
                          onChange={() => change({ tripId: c.id })}
                        />
                        <span>
                          <strong>{c.title}</strong>
                          <span>{c.description}</span>
                          <small>
                            Departure {c.start} · Arrival {c.end} ·{" "}
                            {remainingSeats(state, c.id, d.date)} seats ·{" "}
                            {money(state.prices[c.id])}/passenger
                          </small>
                        </span>
                      </label>
                    ))}
                  <Field label="Shuttle passengers">
                    <input
                      type="number"
                      min="1"
                      max={remainingSeats(state, d.tripId || "", d.date)}
                      step="1"
                      required
                      value={d.passengers}
                      onChange={(e) =>
                        change({ passengers: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <p className="soft-note">
                    Contact: {user?.name} · {user?.email}. Your shared details
                    are carried forward.
                  </p>
                </>
              )}
              <div className="form-actions">
                {step === "shuttle" && (
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => setStep("details")}
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>
                )}
                <button type="submit" className="primary">
                  {pack && step === "details"
                    ? "Continue to shuttle"
                    : "Review reservation"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </form>
          )}
          {step === "review" && (
            <div className="review-body">
              <span className="eyebrow">REVIEW</span>
              <h2>{pack ? "Review package" : "Review reservation"}</h2>
              <dl className="detail-facts">
                <div>
                  <dt>Service</dt>
                  <dd>{item.title}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{d.date}</dd>
                </div>
                <div>
                  <dt>Time</dt>
                  <dd>
                    {isClass(d)
                      ? `${item.start}–${item.end}`
                      : d.kind === "shuttle"
                        ? `${item.start}–${item.end}`
                        : d.kind === "ride"
                          ? d.start
                          : `${d.start}–${d.end}`}
                  </dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>
                    {user?.name} · {user?.email}
                  </dd>
                </div>
                {isRoom(d) && (
                  <>
                    <div>
                      <dt>Event</dt>
                      <dd>{d.event}</dd>
                    </div>
                    <div>
                      <dt>Attendance</dt>
                      <dd>{d.people}</dd>
                    </div>
                  </>
                )}
                {hasTrip(d) && (
                  <div>
                    <dt>Shuttle</dt>
                    <dd>
                      {(trip || item).title} · {(trip || item).start}–
                      {(trip || item).end} · {d.passengers} passengers
                    </dd>
                  </div>
                )}
                {d.kind === "ride" && (
                  <>
                    <div>
                      <dt>Route</dt>
                      <dd>
                        {d.pickup} → {d.destination}
                      </dd>
                    </div>
                    <div>
                      <dt>Passengers</dt>
                      <dd>{d.passengers}</dd>
                    </div>
                  </>
                )}
                {d.kind === "care" && (
                  <>
                    <div>
                      <dt>Recipient</dt>
                      <dd>{d.recipient}</dd>
                    </div>
                    <div>
                      <dt>Home address</dt>
                      <dd>{d.address}</dd>
                    </div>
                    <div>
                      <dt>Assistance</dt>
                      <dd>{d.notes}</dd>
                    </div>
                  </>
                )}
              </dl>
              <PriceSummary lines={q.lines} total={q.total} />
              <p className="soft-note">
                {q.total > 0
                  ? "Payment is simulated. No real money will be charged."
                  : "This reservation is free. No payment is required."}
              </p>
              <div className="form-actions">
                <button
                  className="secondary"
                  onClick={() => {
                    setStep("details");
                    setError("");
                  }}
                >
                  <Pencil size={14} />
                  Edit details
                </button>
                <button
                  className="primary"
                  onClick={() => {
                    try {
                      validateBooking(state, d);
                      if (q.total !== reviewTotal) {
                        setReviewTotal(q.total);
                        setError(
                          "Prices changed. Review the updated total before continuing.",
                        );
                        return;
                      }
                      if (q.total > 0) setStep("payment");
                      else finish();
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  {q.total > 0
                    ? "Continue to simulated payment"
                    : d.kind === "ride"
                      ? "Submit ride request"
                      : "Confirm reservation"}
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
          {step === "payment" && (
            <div className="review-body">
              <span className="service-icon">
                <ShieldCheck size={30} />
              </span>
              <span className="eyebrow">SIMULATED PAYMENT</span>
              <h2>Simulated payment</h2>
              <p>No card information is collected and no money moves.</p>
              <PriceSummary lines={q.lines} total={q.total} />
              <div className="form-actions">
                <button className="secondary" onClick={() => setStep("review")}>
                  Back to review
                </button>
                <button className="primary" onClick={finish}>
                  Simulate payment <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
        <aside className="panel booking-summary">
          <span className="eyebrow">RESERVATION SUMMARY</span>
          <h2>{item.title}</h2>
          <p>
            {d.date}
            {isClass(d)
              ? ` · ${item.start}–${item.end}`
              : d.start
                ? ` · ${d.start}${d.end ? `–${d.end}` : ""}`
                : ""}
          </p>
          {trip && (
            <p>
              + {trip.title} · {d.passengers} passengers
            </p>
          )}
          <PriceSummary
            lines={q.lines.filter((l) => Number.isFinite(l.amount))}
            total={Number.isFinite(q.total) ? q.total : 0}
          />
          <p className="service-footnote">
            Fictional availability and sample prices. All payments are
            simulated.
          </p>
        </aside>
      </div>
      {addons && (
        <Modal title="Optional room add-ons" onClose={() => setAddons(false)}>
          <div className="form">
            <p>
              Add only what your event needs. You can leave every option off.
            </p>
            <Field
              label={`Catering guests · ${money(state.prices.catering)} / person`}
            >
              <input
                type="number"
                min="0"
                max={d.people}
                step="1"
                value={d.catering}
                onChange={(e) => change({ catering: Number(e.target.value) })}
              />
            </Field>
            <label className="check-row">
              <input
                type="checkbox"
                checked={d.cleaning}
                onChange={(e) => change({ cleaning: e.target.checked })}
              />
              Room cleaning · {money(state.prices.cleaning)}
            </label>
            <div className="form-grid">
              <Field label={`Tables · ${money(state.prices.table)} each`}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={d.tables}
                  onChange={(e) => change({ tables: Number(e.target.value) })}
                />
              </Field>
              <Field label={`Chairs · ${money(state.prices.chair)} each`}>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={d.chairs}
                  onChange={(e) => change({ chairs: Number(e.target.value) })}
                />
              </Field>
            </div>
            <p className="soft-note">
              Catering is provided by a vendor. One simple catering option is
              shown.
            </p>
            <button className="primary" onClick={() => setAddons(false)}>
              Save add-ons <Check size={16} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
export function PriceSummary({
  lines,
  total,
}: {
  lines: { label: string; amount: number }[];
  total: number;
}) {
  return (
    <div className="price-summary">
      {lines.map((l, i) => (
        <div key={`${l.label}-${i}`}>
          <span>{l.label}</span>
          <strong>{l.amount === 0 ? "Free" : money(l.amount)}</strong>
        </div>
      ))}
      <div className="price-total">
        <span>Total</span>
        <strong>{money(total)}</strong>
      </div>
    </div>
  );
}
