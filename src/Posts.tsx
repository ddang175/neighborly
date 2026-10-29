import { useState } from "react";
import type { FormEvent } from "react";
import {
  HandHeart,
  MessageCircle,
  ArrowUp,
  ArrowDown,
  Heart,
  MapPin,
  ArrowUpRight,
  Send,
  Check,
  Flag,
  LockKeyhole,
  CalendarDays,
} from "lucide-react";
import {
  canPost,
  createPost,
  vote,
  apply,
  approve,
  transition,
  messageAllowed,
  fallbackClose,
  categories,
  kinds,
  editPost,
  addComment,
} from "./model";
import type { Post } from "./model";

import { useApp } from "./context";
import { Avatar, Empty, Modal, Field } from "./ui";

export function PostForm({
  kind,
  onClose,
  edit,
  initialGroup = "",
}: {
  kind: string;
  onClose: () => void;
  edit?: Post;
  initialGroup?: string;
}) {
  const { s, u, mutate, neighborhood, notify } = useApp();
  const [error, setError] = useState(""),
    [photo, setPhoto] = useState(edit?.photo || ""),
    [type, setType] = useState(kind);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget),
      v = Object.fromEntries(f);
    if (!canPost(u, neighborhood)) {
      setError("Approved neighborhood membership required");
      return;
    }
    try {
      const next = structuredClone(s);
      const input = {
        title: String(v.title),
        description: String(v.description),
        location: String(v.location),
        category: String(v.category),
        kind: type,
        group: String(v.group),
        share: f.has("share"),
        date: String(v.date),
        count: Number(v.count) || 1,
        photo,
        neighborhood,
      };
      if (edit) editPost(next, edit.id, u.id, input);
      else createPost(next, u.id, input);
      mutate(
        (s) => Object.assign(s, next),
        edit
          ? "Your changes are saved"
          : "Your post is now part of the neighborhood",
      );
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <Modal
      title={edit ? "Edit your post" : "A little kindness starts here"}
      onClose={onClose}
    >
      <form onSubmit={submit} className="form">
        <p className="muted">
          Free help, useful news, and good things to share with your neighbors.
        </p>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <Field label="Post type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={!!edit}
          >
            {kinds.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Title">
          <input
            name="title"
            required
            maxLength={120}
            defaultValue={edit?.title}
            placeholder="What could use a little neighborly help?"
          />
        </Field>
        <Field label="Description">
          <textarea
            name="description"
            required
            rows={4}
            defaultValue={edit?.description}
            placeholder="Tell your neighbors a little more…"
          />
        </Field>
        <div className="form-grid">
          <Field label="Category">
            <select
              name="category"
              defaultValue={edit?.category || categories[0]}
              required
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Approximate location">
            <input
              name="location"
              required
              defaultValue={edit?.location}
              placeholder="e.g. Near Brookside Park"
            />
          </Field>
        </div>
        <div className="private-note">
          <LockKeyhole size={15} /> Keep street numbers and exact addresses in
          private chat.
        </div>
        <div className="form-grid">
          <Field label="Date and time (optional)">
            <input
              name="date"
              type="datetime-local"
              defaultValue={edit?.date}
            />
          </Field>
          <Field label="Volunteers needed (optional)">
            <input
              name="count"
              type="number"
              min="1"
              max="20"
              defaultValue={edit?.count || 2}
            />
          </Field>
        </div>
        <Field label="Share with">
          <select name="group" defaultValue={edit?.group || initialGroup}>
            <option value="">My neighborhood</option>
            {s.groups
              .filter((g) => g.approved && u.groups.includes(g.name))
              .map((g) => (
                <option key={g.name}>{g.name}</option>
              ))}
          </select>
        </Field>
        <label className="check-row">
          <input
            name="share"
            type="checkbox"
            defaultChecked={edit?.share ?? true}
          />{" "}
          Also show group posts in the neighborhood feed
        </label>
        <Field label="Photo (optional)">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                if (f.size > 2000000) {
                  notify("Please choose an image under 2 MB");
                  return;
                }
                const r = new FileReader();
                r.onload = () => setPhoto(String(r.result));
                r.readAsDataURL(f);
              }
            }}
          />
        </Field>
        {photo.startsWith("data:") && (
          <img className="upload-preview" src={photo} alt="Post preview" />
        )}
        <p className="muted fine-print">
          Keep it local and kind. No political debates, paid-service ads, or
          commercial solicitation.
        </p>
        <div className="form-actions">
          <button type="button" className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" type="submit">
            {edit ? "Save changes" : "Publish post"}
            <ArrowUpRight size={15} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function PostDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { s, u, mutate, notify } = useApp();
  const p = s.posts.find((p) => p.id === id)!;
  const [comment, setComment] = useState(""),
    [msg, setMsg] = useState(""),
    [report, setReport] = useState(false),
    [reason, setReason] = useState(""),
    [edit, setEdit] = useState(false),
    [hours, setHours] = useState(0);
  if (
    !canPost(u, p.neighborhood) ||
    (p.group && !p.share && !u.groups.includes(p.group))
  )
    return (
      <Modal title="Members only" onClose={onClose}>
        <Empty title="This post is private">
          Approved membership in this neighborhood is required.
        </Empty>
      </Modal>
    );
  const author = s.users.find((u) => u.id === p.author)!,
    owner = p.author === u.id,
    participant = p.assigned.includes(u.id),
    chat = messageAllowed(s, id, u.id);
  return (
    <Modal title="A little closer to your neighbors" onClose={onClose} wide>
      <div className="detail-body">
        <div className="post-top">
          <Avatar user={author} />
          <div>
            <strong>{author.name}</strong>
            <p className="muted">
              {p.neighborhood} · {p.category}
            </p>
          </div>
          <span className="kind-tag">{p.kind}</span>
        </div>
        <h1 className="detail-title">{p.title}</h1>
        <p className="detail-description">{p.description}</p>
        <div className="post-meta">
          <span>
            <MapPin size={15} />
            {p.location}
          </span>
          {p.date && (
            <span>
              <CalendarDays size={15} />
              {new Date(p.date).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
        {p.photo.startsWith("data:") && (
          <img className="detail-photo" src={p.photo} alt="Post attachment" />
        )}
        <div className="detail-votes">
          <button
            className="secondary"
            aria-label="Upvote"
            aria-pressed={p.votes[u.id] === 1}
            onClick={() => mutate((s) => vote(s, id, u.id, 1))}
          >
            <ArrowUp size={16} />
            {Object.values(p.votes).reduce((a, b) => a + b, 0)}
          </button>
          <button
            className="secondary"
            aria-label="Downvote"
            aria-pressed={p.votes[u.id] === -1}
            onClick={() => mutate((s) => vote(s, id, u.id, -1))}
          >
            <ArrowDown size={16} />
          </button>
          <button
            className="secondary"
            aria-label="React with appreciation"
            aria-pressed={p.reactions.includes(u.id)}
            onClick={() =>
              mutate((s) => {
                const x = s.posts.find((p) => p.id === id)!;
                x.reactions = x.reactions.includes(u.id)
                  ? x.reactions.filter((a) => a !== u.id)
                  : [...x.reactions, u.id];
              })
            }
          >
            <Heart size={16} />
            {p.reactions.length}
          </button>
          <button
            className="text-button"
            aria-label="Report post"
            onClick={() => setReport(!report)}
          >
            <Flag size={15} />
            Report
          </button>
          {!owner && (
            <button
              className="text-button"
              onClick={() => {
                mutate(
                  (s) =>
                    s.users.find((a) => a.id === u.id)!.blocked.push(p.author),
                  "Neighbor blocked from your feed",
                );
                onClose();
              }}
            >
              Block neighbor
            </button>
          )}
          {owner && (
            <>
              <button className="text-button" onClick={() => setEdit(true)}>
                Edit post
              </button>
              <button
                className="text-button danger"
                onClick={() => {
                  mutate((s) => {
                    s.posts = s.posts.filter((a) => a.id !== id);
                  }, "Post removed");
                  onClose();
                }}
              >
                Delete post
              </button>
            </>
          )}
        </div>
        {p.kind === "Help request" && (
          <section className="task-panel">
            <div className="section-heading">
              <h3>Helping hands</h3>
              <span className="status-badge">{p.status}</span>
            </div>
            <p className="muted">
              {p.assigned.length} of {p.count} volunteers approved · Approval
              opens a private task chat.
            </p>
            {!owner &&
              u.available &&
              ["Open", "Assigned"].includes(p.status) &&
              !participant && (
                <button
                  className="primary"
                  disabled={!!p.group && !u.groups.includes(p.group)}
                  onClick={() =>
                    mutate(
                      (s) => apply(s, id, u.id),
                      p.applications.includes(u.id)
                        ? "Application withdrawn"
                        : "Application sent to the requester",
                    )
                  }
                >
                  {p.applications.includes(u.id)
                    ? "Withdraw application"
                    : "Volunteer for this"}
                  <HandHeart size={16} />
                </button>
              )}
            {!u.available && !owner && (
              <p className="muted">
                Enable volunteer availability in your profile to apply.
              </p>
            )}
            {p.assigned.map((a) => (
              <div className="person-row" key={a}>
                <Avatar user={s.users.find((u) => u.id === a)!} size="small" />
                <span>{s.users.find((u) => u.id === a)!.name}</span>
                <span className="approved">
                  <Check size={14} />
                  Approved
                </span>
              </div>
            ))}
            {owner &&
              p.applications.map((a) => {
                const v = s.users.find((u) => u.id === a)!;
                return (
                  <div className="person-row" key={a}>
                    <Avatar user={v} size="small" />
                    <span>
                      {v.name}
                      <small>
                        {v.completed} tasks · {v.points} points
                      </small>
                    </span>
                    <button
                      className="secondary compact"
                      disabled={p.assigned.length >= p.count}
                      aria-label={`Approve ${v.name.split(" ")[0]}`}
                      onClick={() =>
                        mutate(
                          (s) => approve(s, id, u.id, a),
                          "Volunteer approved. Task chat is open.",
                        )
                      }
                    >
                      Approve
                    </button>
                    <button
                      className="text-button"
                      aria-label={`Reject ${v.name.split(" ")[0]}`}
                      onClick={() =>
                        mutate((s) => {
                          s.posts.find((p) => p.id === id)!.applications =
                            p.applications.filter((i) => i !== a);
                        }, "Application declined")
                      }
                    >
                      Decline
                    </button>
                  </div>
                );
              })}
            <div className="task-actions">
              {(owner || participant) && (
                <>
                  {p.status === "Assigned" && (
                    <button
                      className="primary"
                      onClick={() =>
                        mutate((s) => transition(s, id, u.id, "In progress"))
                      }
                    >
                      Start task
                    </button>
                  )}
                  {p.status === "In progress" && (
                    <button
                      className="primary"
                      onClick={() =>
                        mutate((s) =>
                          transition(s, id, u.id, "Awaiting confirmation"),
                        )
                      }
                    >
                      Request completion
                    </button>
                  )}
                  {p.status === "Awaiting confirmation" && owner && (
                    <button
                      className="primary"
                      onClick={() =>
                        mutate(
                          (s) => transition(s, id, u.id, "Completed"),
                          "Thank you! Each approved volunteer earned 10 points.",
                        )
                      }
                    >
                      Confirm completion
                    </button>
                  )}
                  {[
                    "Open",
                    "Assigned",
                    "In progress",
                    "Awaiting confirmation",
                  ].includes(p.status) && (
                    <button
                      className="secondary"
                      onClick={() =>
                        mutate((s) => transition(s, id, u.id, "Cancelled"))
                      }
                    >
                      Cancel task
                    </button>
                  )}
                  {p.status === "Cancelled" && owner && (
                    <button
                      className="primary"
                      onClick={() =>
                        mutate(
                          (s) => transition(s, id, u.id, "Open"),
                          "Request reopened. Previous assignment remains in history.",
                        )
                      }
                    >
                      Reopen request
                    </button>
                  )}
                </>
              )}
              {p.status === "Completed" && (
                <span className="approved">
                  <Check size={16} /> Completion points awarded once
                </span>
              )}
            </div>
            {participant && p.status === "Awaiting confirmation" && (
              <div className="fallback">
                <p>
                  Waiting for requester confirmation. A reviewable fallback is
                  available after 72 hours.
                </p>
                <button className="text-button" onClick={() => setHours(72)}>
                  Demo: advance confirmation clock 72 hours
                </button>
                <button
                  className="secondary"
                  disabled={hours < 72}
                  onClick={() =>
                    mutate(
                      (s) => fallbackClose(s, id, u.id, hours),
                      "Task closed; moderator review recorded",
                    )
                  }
                >
                  Close after 72 hours
                </button>
              </div>
            )}
            <details className="history" open>
              <summary>Task history</summary>
              {p.history.map((h, i) => (
                <p key={i}>
                  <span /> {h}
                </p>
              ))}
            </details>
          </section>
        )}
        {chat && (
          <section className="chat-panel">
            <h3>Task chat · {p.assigned.length + 1} participants</h3>
            <p className="private-note">
              <LockKeyhole size={14} /> Only the requester and approved
              volunteers can see this chat.
            </p>
            {p.messages.length ? (
              p.messages.map((m, i) => (
                <div
                  key={i}
                  className={`message ${m.user === u.id ? "mine" : ""}`}
                >
                  <strong>{s.users.find((u) => u.id === m.user)!.name}</strong>
                  <p>{m.text}</p>
                </div>
              ))
            ) : (
              <p className="muted">
                Say hello, make a plan, and share an exact address here if
                needed.
              </p>
            )}
            <form
              className="inline-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (msg.trim())
                  mutate((s) =>
                    s.posts
                      .find((p) => p.id === id)!
                      .messages.push({ user: u.id, text: msg.trim() }),
                  );
                setMsg("");
              }}
            >
              <input
                placeholder="Write a message…"
                aria-label="Task message"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
              />
              <button className="primary" aria-label="Send message">
                <Send size={17} />
              </button>
            </form>
          </section>
        )}
        {p.kind === "Offer help" && !owner && (
          <button
            className="primary"
            onClick={() => {
              if (s.dm.some((d) => d.from === u.id && d.to === author.id)) {
                notify("You already have a message request with this neighbor");
                return;
              }
              mutate(
                (s) =>
                  s.dm.push({
                    id: crypto.randomUUID(),
                    from: u.id,
                    to: author.id,
                    accepted: false,
                    messages: [],
                  }),
                "Message request sent. The neighbor must accept before chatting.",
              );
            }}
          >
            Send a message request
            <MessageCircle size={16} />
          </button>
        )}
        <section className="comments">
          <h3>
            Neighborly conversation <span>{p.comments.length}</span>
          </h3>
          {p.comments.map((c, i) => (
            <div className="comment" key={i}>
              <Avatar
                user={s.users.find((u) => u.id === c.user)!}
                size="small"
              />
              <div>
                <strong>{s.users.find((u) => u.id === c.user)!.name}</strong>
                <p>{c.text}</p>
              </div>
            </div>
          ))}
          <form
            className="inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (comment.trim())
                mutate((s) => addComment(s, id, u.id, comment.trim()));
              setComment("");
            }}
          >
            <input
              placeholder="Add a neighborly comment…"
              aria-label="Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button className="primary" type="submit">
              Post comment
            </button>
          </form>
        </section>
        {(report || p.status === "Completed") && (
          <section className="report-form">
            <h3>
              {report
                ? "Let’s keep this a kind place"
                : "Share feedback or report a task experience"}
            </h3>
            <p className="muted">
              Reports are reviewed by a moderator. No points are removed
              automatically.
            </p>
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                mutate(
                  (s) =>
                    s.reports.push({
                      id: crypto.randomUUID(),
                      post: id,
                      reporter: u.id,
                      reason,
                      status: "Open",
                      decision: "",
                      escalated: false,
                    }),
                  "Report submitted for neighborhood review",
                );
                setReport(false);
                setReason("");
              }}
            >
              <Field label="Report reason">
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                />
              </Field>
              <button className="secondary" type="submit">
                Submit report
              </button>
            </form>
          </section>
        )}
      </div>
      {edit && (
        <PostForm kind={p.kind} edit={p} onClose={() => setEdit(false)} />
      )}
    </Modal>
  );
}
