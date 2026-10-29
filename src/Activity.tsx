import { useState } from "react";

import { Users, Bell, MapPin, ArrowUpRight } from "lucide-react";
import { badges, statuses } from "./model";

import { useApp } from "./context";
import { Avatar, Empty, PageTitle } from "./ui";

export function Tasks() {
  const { s, u, open } = useApp();
  const [filter, setFilter] = useState("All tasks");
  const posts = s.posts.filter(
    (p) =>
      p.kind === "Help request" &&
      (p.author === u.id ||
        p.assigned.includes(u.id) ||
        p.applications.includes(u.id)) &&
      (filter === "All tasks" || p.status === filter),
  );
  return (
    <>
      <PageTitle
        eyebrow="THE KINDNESS YOU SET IN MOTION"
        title="Your helping hands, all in one place."
        description="Keep track of the help you’ve asked for and the time you’ve offered."
      />
      <div className="filter-tabs task-tabs">
        {["All tasks", ...statuses].map((t) => (
          <button
            className={t === filter ? "selected" : ""}
            key={t}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="task-grid">
        {posts.length ? (
          posts.map((p) => (
            <div className="panel task-tile" key={p.id}>
              <div className="section-heading">
                <span className="eyebrow">
                  {p.author === u.id ? "YOUR REQUEST" : "YOU’RE HELPING"}
                </span>
                <span className="status-badge">{p.status}</span>
              </div>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <div className="post-meta">
                <span>
                  <MapPin size={14} />
                  {p.location}
                </span>
                <span>
                  <Users size={14} />
                  {p.assigned.length} approved
                </span>
              </div>
              <button className="text-button" onClick={() => open(p.id)}>
                View task & conversation <ArrowUpRight size={15} />
              </button>
            </div>
          ))
        ) : (
          <Empty title="A fresh start for a good deed">
            Find a request in your neighborhood and volunteer to help.
          </Empty>
        )}
      </div>
    </>
  );
}

export function Leaderboard() {
  const { s, u } = useApp();
  const users = s.users
    .filter(
      (a) => a.neighborhood === u.neighborhood && a.membership === "Approved",
    )
    .sort((a, b) => b.points - a.points);
  return (
    <>
      <PageTitle
        eyebrow="KINDNESS HAS A RIPPLE EFFECT"
        title="Good neighbors deserve a little recognition."
        description="Every helping hand makes our neighborhood stronger. Here’s to the people who show up."
      />
      <div className="recognition-hero">
        <span>✺</span>
        <div>
          <span className="eyebrow">YOUR LITTLE RIPPLE</span>
          <h2>{u.points} points of community spirit.</h2>
          <p>
            {u.completed} confirmed tasks · {badges(u).length} badges earned
          </p>
        </div>
        <Avatar user={u} />
      </div>
      <div className="leader-columns">
        <section className="panel">
          <div className="section-heading">
            <h2>Old Town helpers</h2>
            <span className="tiny-tag">All time</span>
          </div>
          <p className="muted">
            A celebration of participation, one good deed at a time.
          </p>
          {users.map((v, i) => (
            <div className="leader-row" key={v.id}>
              <span className={`rank rank-${i}`}>
                {i === 0 ? "♛" : String(i + 1).padStart(2, "0")}
              </span>
              <Avatar user={v} />
              <div>
                <strong>
                  {v.name}
                  {v.id === u.id && <small> (you)</small>}
                </strong>
                <span>{v.completed} helping hands lent</span>
              </div>
              <strong data-testid={`score-${v.id}`}>
                {v.points}
                <small> points</small>
              </strong>
            </div>
          ))}
        </section>
        <section className="panel badge-panel">
          <h2>Little milestones. Lasting impact.</h2>
          <p className="muted">Your badges grow with your kindness.</p>
          <div className="badges">
            {badges(u).map((b, i) => (
              <div className="badge" key={b}>
                <span>{["✺", "❋", "✧", "♡"][i % 4]}</span>
                <strong>{b}</strong>
                <small>Earned with kindness</small>
              </div>
            ))}
          </div>
          <div className="scoring-note">
            <h3>How kindness adds up</h3>
            <p>
              +1 / −1 for net post votes
              <br />
              +10 per confirmed task, per volunteer
              <br />
              Points badges: 50, 100, 250
              <br />
              Task badges: 1, 5, 10
              <br />
              Category badge: 5 confirmed tasks
            </p>
            <small>
              No cash value. Complaints require review before any penalty.
            </small>
          </div>
        </section>
      </div>
    </>
  );
}

export function Alerts() {
  const { s, u, mutate, open, setView } = useApp();
  const alerts = s.alerts.filter(
    (a) => a.user === u.id && a.channels.includes("website"),
  );
  return (
    <>
      <PageTitle
        eyebrow="A LITTLE WORD FROM YOUR NEIGHBORS"
        title="You’re in the loop."
        description="Helping hands, friendly updates, and little moments that matter."
      >
        <button
          className="secondary"
          onClick={() =>
            mutate(
              (s) =>
                s.alerts
                  .filter((a) => a.user === u.id)
                  .forEach((a) => (a.read = true)),
              "All alerts marked as read",
            )
          }
        >
          Mark all as read
        </button>
      </PageTitle>
      <section className="panel alerts-list">
        {alerts.length ? (
          alerts.map((a) => (
            <button
              className={`alert-item ${a.read ? "" : "unread"}`}
              key={a.id}
              onClick={() => {
                mutate((s) => {
                  s.alerts.find((v) => v.id === a.id)!.read = true;
                });
                if (a.post) open(a.post);
              }}
            >
              <span className="alert-icon">
                <Bell size={20} />
              </span>
              <div>
                <strong>{a.text}</strong>
                <small>
                  Simulated · {a.channels.join(" + ")} ·{" "}
                  {a.read ? "Read" : "New"}
                </small>
              </div>
              <ArrowUpRight size={17} />
            </button>
          ))
        ) : (
          <Empty title="A quiet moment in the neighborhood">
            When a matching request needs your help, you’ll hear about it here.
          </Empty>
        )}
      </section>
      <button
        className="text-button bottom-link"
        onClick={() => setView("Settings")}
      >
        Make these updates your own <ArrowUpRight size={15} />
      </button>
    </>
  );
}
