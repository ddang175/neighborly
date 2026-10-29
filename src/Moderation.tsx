import { useState } from "react";

import { ShieldCheck, ArrowUpRight, LockKeyhole } from "lucide-react";

import { useApp } from "./context";
import { Avatar, Empty, Modal, PageTitle, Field } from "./ui";

export function Moderation() {
  const { s, u, mutate, notify } = useApp();
  const [review, setReview] = useState(""),
    [action, setAction] = useState("Resolve"),
    [decision, setDecision] = useState(""),
    [penalty, setPenalty] = useState(0);
  const staff = u.role === "Staff";
  const reports = s.reports.filter((r) => {
    const p = s.posts.find((p) => p.id === r.post);
    return staff
      ? r.escalated || r.status === "Open"
      : !r.escalated && (!p || p.neighborhood === u.neighborhood);
  });
  return (
    <>
      <PageTitle
        eyebrow={staff ? "NONPROFIT STAFF" : "CARE FOR YOUR COMMUNITY"}
        title={
          staff
            ? "A little oversight. A stronger community."
            : "Keep the neighborhood kind."
        }
        description="Review thoughtfully. Record a reason. Help every neighbor feel at home."
      />
      <div className="moderation-grid">
        <section className="panel">
          <h2>Reports & task experiences</h2>
          <p className="muted">
            Reports do not change reputation until reviewed with a reason.
          </p>
          {reports.length ? (
            reports.map((r) => (
              <div className="report-item" key={r.id}>
                <div className="section-heading">
                  <strong>
                    {s.posts.find((p) => p.id === r.post)?.title ||
                      "Removed post"}
                  </strong>
                  <span className="status-badge">{r.status}</span>
                </div>
                <p>{r.reason}</p>
                <small className="muted">
                  Reported by {s.users.find((v) => v.id === r.reporter)?.name}
                  {r.escalated ? " · Escalated to staff" : ""}
                </small>
                {r.decision && <p className="decision-note">{r.decision}</p>}
                {r.status === "Open" && (
                  <button
                    className="text-button"
                    onClick={() => {
                      setReview(r.id);
                      setDecision("");
                      setAction("Resolve");
                      setPenalty(0);
                    }}
                  >
                    Review report <ArrowUpRight size={14} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <Empty title="All quiet on the review front" />
          )}
        </section>
        <section className="panel">
          <h2>{staff ? "Neighborhood proposals" : "Membership review"}</h2>
          {!staff &&
            s.users
              .filter(
                (v) =>
                  v.membership === "Pending" &&
                  v.neighborhood === u.neighborhood,
              )
              .map((v) => (
                <div className="review-item" key={v.id}>
                  <div className="person-row">
                    <Avatar user={v} />
                    <div>
                      <strong>{v.name}</strong>
                      <small>Self-declared residency</small>
                    </div>
                  </div>
                  <p className="private-note">
                    <LockKeyhole size={13} />
                    Privately submitted: {v.address}
                  </p>
                  <div className="form-actions">
                    <button
                      className="secondary"
                      onClick={() =>
                        mutate((s) => {
                          s.users.find((a) => a.id === v.id)!.membership =
                            "Approved";
                        }, "Membership approved")
                      }
                    >
                      Approve membership
                    </button>
                    <button
                      className="text-button danger"
                      onClick={() =>
                        mutate((s) => {
                          s.users.find((a) => a.id === v.id)!.membership =
                            "Rejected";
                        }, "Membership declined")
                      }
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
          <h3 className="spaced">
            {staff ? "Proposed neighborhoods" : "Proposed groups"}
          </h3>
          {s.proposals
            .filter(
              (p) =>
                p.type === (staff ? "Neighborhood" : "Group") &&
                (staff || p.neighborhood === u.neighborhood),
            )
            .map((p) => (
              <div key={p.id} className="review-item">
                <strong>{p.name}</strong>
                <p>{p.status}</p>
                {p.status === "Pending" && (
                  <div className="form-actions">
                    <button
                      className="secondary"
                      onClick={() => {
                        mutate((s) => {
                          s.proposals.find((a) => a.id === p.id)!.status =
                            "Approved";
                          if (p.type === "Group")
                            s.groups.push({
                              name: p.name,
                              description:
                                p.description ||
                                "A new local circle for neighbors.",
                              icon: "☀️",
                              approved: true,
                              neighborhood: p.neighborhood || u.neighborhood,
                            });
                        }, `${p.type} approved`);
                      }}
                    >
                      Approve {p.type.toLowerCase()}
                    </button>
                    <button
                      className="text-button"
                      onClick={() =>
                        mutate((s) => {
                          s.proposals.find((a) => a.id === p.id)!.status =
                            "Rejected";
                        })
                      }
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          {!s.proposals.length && (
            <p className="muted">New proposals will appear here for review.</p>
          )}
          <div className="scoring-note">
            <ShieldCheck size={25} />
            <h3>Thoughtful, local moderation.</h3>
            <p>
              Neighborhood moderators handle local membership, groups, and
              reports. Staff review escalations and new neighborhoods.
            </p>
          </div>
        </section>
      </div>
      {review && (
        <Modal title="A thoughtful review" onClose={() => setReview("")}>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!decision.trim()) {
                notify("Record a reason for your decision");
                return;
              }
              mutate((s) => {
                const r = s.reports.find((a) => a.id === review)!;
                const p = s.posts.find((a) => a.id === r.post);
                r.decision = decision;
                r.status = action === "Escalate to staff" ? "Open" : "Resolved";
                r.escalated =
                  action === "Escalate to staff" || (staff && r.escalated);
                if (action === "Remove post")
                  s.posts = s.posts.filter((a) => a.id !== r.post);
                if (action === "Suspend author" && p)
                  s.users.find((v) => v.id === p.author)!.membership =
                    "Suspended";
                if (p && penalty > 0)
                  s.users.find((v) => v.id === p.author)!.points -= penalty;
              }, "Moderation decision recorded");
              setReview("");
            }}
          >
            <Field label="Action">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                {[
                  "Resolve",
                  "Remove post",
                  "Suspend author",
                  ...(!staff ? ["Escalate to staff"] : []),
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Decision reason">
              <textarea
                required
                rows={3}
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
              />
            </Field>
            <Field label="Reviewed reputation penalty (points)">
              <input
                type="number"
                min="0"
                max="100"
                value={penalty}
                onChange={(e) => setPenalty(Number(e.target.value))}
              />
            </Field>
            <p className="muted">
              Only apply a justified penalty after reviewing the reported
              experience.
            </p>
            <button className="primary">Resolve report</button>
          </form>
        </Modal>
      )}
    </>
  );
}
