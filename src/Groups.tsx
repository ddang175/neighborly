import { useState } from "react";

import { Users, Plus, Clock, ArrowUpRight, Check } from "lucide-react";
import { canPost } from "./model";
import type { Post } from "./model";

import { useApp } from "./context";
import { Empty, Modal, PageTitle, Field } from "./ui";
import { PostForm } from "./Posts";

export function Groups() {
  const { s, u, mutate, setView, neighborhood, notify } = useApp();
  const [proposal, setProposal] = useState(false),
    [focused, setFocused] = useState(""),
    [kind, setKind] = useState("Help request");
  const can = canPost(u, neighborhood);
  return (
    <>
      <PageTitle
        eyebrow="YOUR PEOPLE, CLOSE TO HOME"
        title="Find your local circle."
        description="Shared interests. Familiar faces. More reasons to feel at home."
      >
        <button
          className="primary"
          disabled={!can}
          onClick={() => setProposal(true)}
        >
          <Plus size={17} />
          Propose a group
        </button>
      </PageTitle>
      <div className="group-grid">
        {s.groups
          .filter((g) => g.approved && g.neighborhood === neighborhood)
          .map((g) => (
            <section className="panel group-card" key={g.name}>
              <div
                className={`group-banner group-${g.icon === "🌱" ? "garden" : g.icon === "📚" ? "books" : "sun"}`}
              >
                <span>{g.icon}</span>
              </div>
              <div className="group-body">
                <span className="eyebrow">
                  {g.neighborhood.toUpperCase()} · COMMUNITY GROUP
                </span>
                <h2>{g.name}</h2>
                <p>{g.description}</p>
                <div className="group-members">
                  <Users size={15} />
                  {s.users.filter((u) => u.groups.includes(g.name)).length +
                    20}{" "}
                  neighbors
                </div>
                <div className="form-actions">
                  <button
                    className={
                      u.groups.includes(g.name) ? "secondary" : "primary"
                    }
                    disabled={!can}
                    aria-label={`${u.groups.includes(g.name) ? "Leave" : "Join"} ${g.name}`}
                    onClick={() =>
                      mutate(
                        (s) => {
                          const v = s.users.find((v) => v.id === u.id)!;
                          v.groups = v.groups.includes(g.name)
                            ? v.groups.filter((a) => a !== g.name)
                            : [...v.groups, g.name];
                        },
                        u.groups.includes(g.name)
                          ? "You left the group"
                          : "Welcome to your new circle!",
                      )
                    }
                  >
                    {u.groups.includes(g.name) ? (
                      <>
                        <Check size={15} />
                        Joined · Leave
                      </>
                    ) : (
                      "Join group"
                    )}
                  </button>
                  <button
                    className="text-button"
                    onClick={() => setFocused(g.name)}
                  >
                    View circle <ArrowUpRight size={15} />
                  </button>
                </div>
              </div>
            </section>
          ))}
      </div>
      {s.proposals
        .filter((p) => p.type === "Group" && p.user === u.id)
        .map((p) => (
          <div className="notice amber" key={p.id}>
            <Clock size={17} />
            {p.name} · {p.status} moderator review
          </div>
        ))}
      {focused && (
        <Modal title={focused} onClose={() => setFocused("")} wide>
          <div className="detail-body">
            <p className="muted">
              A local circle in {neighborhood}. Join to participate and receive
              matching request alerts.
            </p>
            {u.groups.includes(focused) && (
              <>
                <button className="primary" onClick={() => setKind("compose")}>
                  Post to this group
                </button>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={u.muted.includes(focused)}
                    onChange={() =>
                      mutate((s) => {
                        const v = s.users.find((v) => v.id === u.id)!;
                        v.muted = v.muted.includes(focused)
                          ? v.muted.filter((g) => g !== focused)
                          : [...v.muted, focused];
                      })
                    }
                  />
                  Mute {focused}
                </label>
              </>
            )}
            {s.posts
              .filter(
                (p) =>
                  can &&
                  p.group === focused &&
                  (p.share || u.groups.includes(focused)),
              )
              .map((p) => (
                <GroupPost key={p.id} p={p} />
              ))}
            {!s.posts.some(
              (p) =>
                can &&
                p.group === focused &&
                (p.share || u.groups.includes(focused)),
            ) && <Empty title="Your circle is just getting started" />}
          </div>
        </Modal>
      )}
      {kind === "compose" && (
        <PostForm
          initialGroup={focused}
          kind="Help request"
          onClose={() => setKind("Help request")}
        />
      )}{" "}
      {proposal && (
        <Modal
          title="Make room for a new circle"
          onClose={() => setProposal(false)}
        >
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget),
                name = String(f.get("name")).trim();
              if (
                s.groups.some(
                  (g) => g.name.toLowerCase() === name.toLowerCase(),
                ) ||
                s.proposals.some(
                  (g) => g.name.toLowerCase() === name.toLowerCase(),
                )
              ) {
                notify("A group with this name already exists");
                return;
              }
              mutate(
                (s) =>
                  s.proposals.push({
                    id: crypto.randomUUID(),
                    name,
                    type: "Group",
                    status: "Pending",
                    user: u.id,
                    neighborhood: u.neighborhood,
                    description: String(f.get("description")).trim(),
                  }),
                "Proposal sent for moderator approval",
              );
              setProposal(false);
            }}
          >
            <p className="muted">
              A moderator will review your idea before the group becomes
              available.
            </p>
            <Field label="Group name">
              <input name="name" required />
            </Field>
            <Field label="What brings this group together?">
              <textarea required name="description" rows={3} />
            </Field>
            <button className="primary">Submit proposal</button>
          </form>
        </Modal>
      )}
      <button
        className="text-button bottom-link"
        onClick={() => setView("Neighborhood")}
      >
        Back to the neighborhood
      </button>
    </>
  );
}

export function GroupPost({ p }: { p: Post }) {
  const { open } = useApp();
  return (
    <div className="group-post">
      <span className="kind-tag">{p.kind}</span>
      <h3>{p.title}</h3>
      <p>{p.description}</p>
      <button className="text-button" onClick={() => open(p.id)}>
        Open post <ArrowUpRight size={15} />
      </button>
    </div>
  );
}
