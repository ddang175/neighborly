import { useState } from "react";

import {
  ShieldCheck,
  Leaf,
  MapPin,
  ArrowUpRight,
  Flower2,
  Sprout,
  LockKeyhole,
} from "lucide-react";
import { badges, categories } from "./model";
import type { User } from "./model";

import { useApp } from "./context";
import { Avatar, Modal, PageTitle, Field, NeighborhoodOptions } from "./ui";

export function Profile() {
  const { u, mutate, setView } = useApp();
  const [editing, setEditing] = useState(false);
  return (
    <>
      <PageTitle
        eyebrow="A FAMILIAR FACE IN THE NEIGHBORHOOD"
        title="Your little corner."
        description="A bit about you, and the good you bring to your community."
      />
      <section className="profile-cover">
        <div className="cover-art">
          <Sprout size={100} />
          <Flower2 size={130} />
          <Leaf size={100} />
        </div>
        <div className="profile-summary">
          <Avatar user={u} />
          <div>
            <h2>{u.name}</h2>
            <p>
              <MapPin size={14} />
              {u.neighborhood} · Ames, Iowa
            </p>
          </div>
          <span className="status-badge">{u.membership} neighbor</span>
          <button className="secondary" onClick={() => setEditing(!editing)}>
            {editing ? "Close editor" : "Edit profile"}
          </button>
        </div>
      </section>
      <div className="profile-columns">
        <section className="panel">
          <h2>A little about me</h2>
          {editing ? (
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                mutate((s) => {
                  const v = s.users.find((v) => v.id === u.id)!;
                  v.name = String(f.get("name")).trim();
                  v.bio = String(f.get("bio")).trim();
                }, "Profile updated");
                setEditing(false);
              }}
            >
              <Field label="Display name">
                <input required name="name" defaultValue={u.name} />
              </Field>
              <Field label="About me">
                <textarea name="bio" defaultValue={u.bio} />
              </Field>
              <button className="primary">Save profile</button>
            </form>
          ) : (
            <p>{u.bio}</p>
          )}
          <h3 className="spaced">A helping hand, on your terms</h3>
          <label className="toggle-row">
            <div>
              <strong>Available to volunteer</strong>
              <small>
                {u.available
                  ? "You’re open to a little neighborly helping."
                  : "Volunteering paused"}
              </small>
            </div>
            <input
              aria-label="Available to volunteer"
              type="checkbox"
              checked={u.available}
              onChange={() =>
                mutate((s) => {
                  s.users.find((v) => v.id === u.id)!.available = !u.available;
                })
              }
            />
          </label>
          <h3 className="spaced">Membership</h3>
          <p className="muted">
            {u.neighborhood} · {u.membership} · Self-declared residency
          </p>
          <button className="text-button" onClick={() => setView("Membership")}>
            Manage neighborhood membership <ArrowUpRight size={15} />
          </button>
          <p className="private-note">
            <LockKeyhole size={15} /> Your exact address is private and never
            appears on your profile.
          </p>
        </section>
        <section className="panel">
          <h2>A little kindness adds up</h2>
          <div className="profile-stats">
            <div>
              <strong>{u.points}</strong>
              <span>community points</span>
            </div>
            <div>
              <strong>{u.completed}</strong>
              <span>tasks completed</span>
            </div>
          </div>
          <div className="badges">
            {badges(u)
              .slice(0, 4)
              .map((b) => (
                <div className="badge" key={b}>
                  <span>✺</span>
                  <strong>{b}</strong>
                </div>
              ))}
          </div>
          <button
            className="text-button"
            onClick={() => setView("Leaderboard")}
          >
            View all recognition <ArrowUpRight size={15} />
          </button>
        </section>
      </div>
    </>
  );
}

export function Preferences() {
  const { s, u, mutate } = useApp();
  const update = (fn: (u: User) => void) =>
    mutate((s) => fn(s.users.find((v) => v.id === u.id)!), "Preferences saved");
  return (
    <>
      <PageTitle
        eyebrow="MAKE YOURSELF AT HOME"
        title="A neighborhood that fits your day."
        description="Choose what you hear about, and how it reaches you."
      />
      <div className="settings-columns">
        <section className="panel">
          <h2>Keep me in the loop</h2>
          <p className="muted">
            Delivery is simulated in this prototype. No real emails or browser
            alerts are sent.
          </p>
          {(["website", "email", "browser"] as const).map((c) => (
            <label className="toggle-row" key={c}>
              <div>
                <strong>
                  {c === "website"
                    ? "Website alerts"
                    : c === "email"
                      ? "Email alerts"
                      : "Browser alerts"}
                </strong>
                <small>
                  {c === "browser"
                    ? "Simulate permission-based browser notifications"
                    : c === "email"
                      ? "A note when a matching neighbor needs help"
                      : "Your neighborhood updates, right here"}
                </small>
              </div>
              <input
                type="checkbox"
                aria-label={`${c === "website" ? "Website" : c === "email" ? "Email" : "Browser"} alerts`}
                checked={u.channels[c]}
                onChange={() =>
                  update((u) => {
                    u.channels[c] = !u.channels[c];
                  })
                }
              />
            </label>
          ))}
          <h3 className="spaced">The help I like to give</h3>
          <p className="muted">
            Only requests matching your selected categories will alert you.
          </p>
          <div className="category-checks">
            {categories.map((c) => (
              <label className="check-row" key={c}>
                <input
                  type="checkbox"
                  checked={u.categories.includes(c)}
                  onChange={() =>
                    update((u) => {
                      u.categories = u.categories.includes(c)
                        ? u.categories.filter((v) => v !== c)
                        : [...u.categories, c];
                    })
                  }
                />
                {c}
              </label>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>A little quiet when you need it</h2>
          <p className="muted">Muted groups won’t send you request alerts.</p>
          {s.groups
            .filter((g) => g.approved)
            .map((g) => (
              <label className="toggle-row" key={g.name}>
                <div>
                  <strong>
                    {g.icon} {g.name}
                  </strong>
                  <small>
                    {u.muted.includes(g.name) ? "Muted" : "Updates welcome"}
                  </small>
                </div>
                <input
                  aria-label={`Mute ${g.name}`}
                  type="checkbox"
                  checked={u.muted.includes(g.name)}
                  onChange={() =>
                    update((u) => {
                      u.muted = u.muted.includes(g.name)
                        ? u.muted.filter((v) => v !== g.name)
                        : [...u.muted, g.name];
                    })
                  }
                />
              </label>
            ))}
          <div className="scoring-note">
            <ShieldCheck size={25} />
            <h3>Your space, your boundaries.</h3>
            <p>
              Your address stays private. Neighbor chats begin only after
              acceptance. Task chats open only to approved participants.
            </p>
          </div>
          {u.blocked.length > 0 && (
            <>
              <h3>Blocked neighbors</h3>
              {u.blocked.map((id) => (
                <div className="person-row" key={id}>
                  {s.users.find((v) => v.id === id)?.name}
                  <button
                    className="text-button"
                    onClick={() =>
                      update((u) => {
                        u.blocked = u.blocked.filter((i) => i !== id);
                      })
                    }
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </>
          )}
        </section>
      </div>
    </>
  );
}

export function Membership() {
  const { s, u, mutate, neighborhood, notify } = useApp();
  const [proposal, setProposal] = useState(false);
  return (
    <>
      <PageTitle
        eyebrow="FIND YOUR PLACE IN AMES"
        title="A neighborhood to call your own."
        description="Membership is self-declared and reviewed by your neighborhood’s moderators."
      />
      <div className="settings-columns">
        <section className="panel">
          <h2>Your membership</h2>
          <div className="membership-state">
            <MapPin size={35} />
            <h2>{u.neighborhood}</h2>
            <span className="status-badge">{u.membership}</span>
            <p className="muted">
              Exact address provided privately · No identity verification
            </p>
          </div>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              mutate((s) => {
                const v = s.users.find((v) => v.id === u.id)!;
                v.neighborhood = String(f.get("neighborhood"));
                v.address = String(f.get("address"));
                v.membership = "Pending";
                v.groups = [];
              }, "Membership request sent for review");
            }}
          >
            <Field label="Neighborhood">
              <select name="neighborhood" defaultValue={neighborhood}>
                <NeighborhoodOptions />
              </select>
            </Field>
            <Field label="Private address">
              <input
                name="address"
                required
                placeholder="Only shared for membership review"
              />
            </Field>
            <label className="check-row">
              <input required type="checkbox" />I self-declare that I live in
              this neighborhood.
            </label>
            <button className="primary">Request membership review</button>
          </form>
        </section>
        <section className="panel">
          <h2>Don’t see your neighborhood?</h2>
          <p>
            Help us make a little more room. Propose a missing neighborhood for
            nonprofit staff review.
          </p>
          <button className="secondary" onClick={() => setProposal(true)}>
            Propose a neighborhood
          </button>
          <div className="scoring-note">
            <ShieldCheck size={30} />
            <h3>A little privacy. A lot of trust.</h3>
            <p>
              Your home address never appears on public feeds. Share an exact
              location in an accepted private conversation only when you’re
              comfortable.
            </p>
          </div>
          {s.proposals
            .filter((p) => p.type === "Neighborhood" && p.user === u.id)
            .map((p) => (
              <p key={p.id}>
                {p.name} · {p.status} staff review
              </p>
            ))}
        </section>
      </div>
      {proposal && (
        <Modal
          title="A new corner of the community"
          onClose={() => setProposal(false)}
        >
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const name = String(
                new FormData(e.currentTarget).get("name"),
              ).trim();
              if (
                ["old town", "somerset", "north ames"].includes(
                  name.toLowerCase(),
                ) ||
                s.proposals.some(
                  (p) => p.name.toLowerCase() === name.toLowerCase(),
                )
              ) {
                notify(
                  "This neighborhood already exists or is awaiting review",
                );
                return;
              }
              mutate(
                (s) =>
                  s.proposals.push({
                    id: crypto.randomUUID(),
                    name,
                    type: "Neighborhood",
                    status: "Pending",
                    user: u.id,
                  }),
                "Neighborhood proposal sent to staff",
              );
              setProposal(false);
            }}
          >
            <Field label="Neighborhood name">
              <input name="name" required />
            </Field>
            <p className="muted">
              Staff approval creates the neighborhood listing. Membership review
              is still required.
            </p>
            <button className="primary">Submit neighborhood proposal</button>
          </form>
        </Modal>
      )}
    </>
  );
}
