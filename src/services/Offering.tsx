import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { useServices } from "./context";
import { submitOffering, dayOffset, today } from "./model";
import type { OfferingInput } from "./model";
import { Field, Calendar, PageTitle, Result } from "./ui";
export function Offering({
  kind,
  onDone,
}: {
  kind: OfferingInput["kind"];
  onDone: () => void;
}) {
  const { user, update } = useServices();
  const [date, setDate] = useState(dayOffset(today(), 1)),
    [recurring, setRecurring] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  if (done)
    return (
      <Result
        title={
          kind === "class" ? "Class submitted." : "Availability submitted."
        }
        onDone={onDone}
      >
        <p>
          {kind === "class"
            ? "Your class is awaiting approval in Mock Admin. It will appear in the class list only after approval."
            : "Your availability and qualifications have been submitted. No approval or automatic assignment is simulated."}
        </p>
      </Result>
    );
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const input: OfferingInput = {
      kind,
      title:
        kind === "class"
          ? String(f.get("title"))
          : kind === "driver"
            ? "Driver availability"
            : "Home-care availability",
      date,
      start: String(f.get("start")),
      end: String(f.get("end")),
      description:
        kind === "class"
          ? String(f.get("description"))
          : "Volunteer availability",
      qualifications: String(f.get("qualifications") || ""),
      prerequisites: String(f.get("prerequisites") || ""),
      language: String(f.get("language") || ""),
      level: String(f.get("level") || ""),
      recurring,
      until: String(f.get("until") || ""),
      modes: f.getAll("modes").map(String),
      services: f.getAll("services").map(String),
    };
    try {
      update((s) => submitOffering(s, user!.id, input));
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <button className="text-button back-link" onClick={onDone}>
        <ArrowLeft size={15} />
        Back to services
      </button>
      <PageTitle
        eyebrow="VOLUNTEER"
        title={
          kind === "class"
            ? "Teach a class."
            : kind === "driver"
              ? "Volunteer to drive."
              : "Provide home care."
        }
        description={
          kind === "class"
            ? "View classes. Submit your course and teaching availability."
            : "Enter your availability and qualifications."
        }
      />
      <div className="detail-layout">
        <section className="panel">
          <form className="form service-form" onSubmit={submit}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <Calendar
              dates={Array.from({ length: 28 }, (_, i) =>
                dayOffset(today(), i + 1),
              )}
              value={date}
              onChange={setDate}
              label="Your availability"
            />
            <div className="form-grid">
              <Field label="Start time">
                <input name="start" type="time" defaultValue="10:00" required />
              </Field>
              <Field label="End time">
                <input name="end" type="time" defaultValue="11:00" required />
              </Field>
            </div>
            {kind === "class" ? (
              <>
                <Field label="Class title">
                  <input name="title" required />
                </Field>
                <Field label="Description">
                  <textarea name="description" required rows={3} />
                </Field>
                <div className="form-grid">
                  <Field label="Language">
                    <input name="language" defaultValue="English" required />
                  </Field>
                  <Field label="Level">
                    <select name="level">
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>All levels</option>
                    </select>
                  </Field>
                </div>
                <Field label="Prerequisites">
                  <input name="prerequisites" defaultValue="None" required />
                </Field>
                <Field label="Class schedule">
                  <select
                    value={recurring ? "weekly" : "once"}
                    onChange={(e) => setRecurring(e.target.value === "weekly")}
                  >
                    <option value="once">One-time session</option>
                    <option value="weekly">Recurring weekly</option>
                  </select>
                </Field>
                {recurring && (
                  <>
                    <p className="soft-note">
                      Repeats every{" "}
                      {new Date(`${date}T12:00`).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}{" "}
                      at the selected time.
                    </p>
                    <Field label="Recurring end date">
                      <input
                        name="until"
                        type="date"
                        min={date}
                        defaultValue={dayOffset(date, 21)}
                        required
                      />
                    </Field>
                  </>
                )}
              </>
            ) : kind === "driver" ? (
              <fieldset className="choice-fieldset">
                <legend>Transportation you can provide (choose any)</legend>
                {["Scheduled shuttle", "On-demand ride"].map((m) => (
                  <label className="check-row" key={m}>
                    <input type="checkbox" name="modes" value={m} />
                    {m}
                  </label>
                ))}
              </fieldset>
            ) : (
              <fieldset className="choice-fieldset">
                <legend>Services you can provide (choose any)</legend>
                {["Home cleaning", "Nursing", "Welfare check"].map((m) => (
                  <label className="check-row" key={m}>
                    <input type="checkbox" name="services" value={m} />
                    {m}
                  </label>
                ))}
              </fieldset>
            )}
            {kind !== "class" && (
              <Field label="Qualifications">
                <textarea
                  name="qualifications"
                  required
                  rows={3}
                  placeholder="Describe your relevant experience and qualifications."
                />
              </Field>
            )}
            <button className="primary" type="submit">
              {kind === "class" ? "Submit class" : "Submit availability"}
              <ArrowUpRight size={16} />
            </button>
          </form>
        </section>
        <aside className="panel helper-panel">
          <span className="eyebrow">SUBMISSION DETAILS</span>
          <h2>Volunteer information</h2>
          <p>
            {kind === "class"
              ? "Classes are taught by volunteers. Your course will stay private until a mock administrator approves it. One-time and weekly schedules are supported."
              : "Select the services you offer and describe your qualifications."}
          </p>
          <div className="soft-note">
            You’re submitting as <strong>{user?.name}</strong>. Please use
            fictional information.
          </div>
        </aside>
      </div>
    </>
  );
}
