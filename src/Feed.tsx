import { useState } from "react";

import {
  HandHeart,
  MessageCircle,
  Users,
  ShieldCheck,
  Leaf,
  Search,
  Plus,
  ArrowUp,
  ArrowDown,
  Heart,
  MapPin,
  ArrowUpRight,
  ChevronRight,
  Sprout,
  SlidersHorizontal,
} from "lucide-react";
import { canPost, vote, categories, statuses } from "./model";
import type { Post } from "./model";

import { useApp } from "./context";
import { Avatar, Empty, PageTitle, GoTo } from "./ui";

export function Feed({
  onCompose,
  help = false,
}: {
  onCompose: (k: string) => void;
  help?: boolean;
}) {
  const { s, u, neighborhood: n, open } = useApp();
  const [q, setQ] = useState(""),
    [tab, setTab] = useState("All posts"),
    [category, setCategory] = useState(""),
    [group, setGroup] = useState(""),
    [status, setStatus] = useState("");
  const tabs = help
    ? ["All posts", "Help requests", "Offers to help"]
    : [
        "All posts",
        "Help requests",
        "Offers to help",
        "Giveaways",
        "Events",
        "PSAs",
        "Garage sales",
      ];
  const mapping: Record<string, string> = {
    "Help requests": "Help request",
    "Offers to help": "Offer help",
    Giveaways: "Giveaway",
    Events: "Event",
    PSAs: "PSA",
    "Garage sales": "Garage sale",
  };
  const visible = canPost(u, n);
  const posts = s.posts.filter(
    (p) =>
      visible &&
      p.neighborhood === n &&
      (!p.group || p.share || u.groups.includes(p.group)) &&
      !u.blocked.includes(p.author) &&
      (!help || ["Help request", "Offer help"].includes(p.kind)) &&
      (!mapping[tab] || p.kind === mapping[tab]) &&
      (!category || p.category === category) &&
      (!group || p.group === group) &&
      (!status || p.status === status) &&
      `${p.title} ${p.description}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow={
          help
            ? "A LITTLE TIME. A BIG DIFFERENCE."
            : "WELCOME TO YOUR LITTLE CORNER OF AMES"
        }
        title={
          help
            ? "A helping hand is closer than you think."
            : "Good neighbors. Great neighborhood."
        }
        description={
          help
            ? "Find a way to give back, or ask for a little support."
            : "Share a little. Help a little. Feel a little more at home."
        }
      >
        <button
          className="primary"
          disabled={!visible}
          onClick={() => onCompose("Help request")}
        >
          <Plus size={18} /> Ask for help
        </button>
      </PageTitle>
      {!help && (
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">
              <span className="live-dot" /> A COMMUNITY THAT SHOWS UP
            </span>
            <h2>
              Small acts.
              <br />
              <em>Stronger connections.</em>
            </h2>
            <p>
              From an extra pair of hands to a cup of borrowed sugar,
              <br className="desktop" /> good things happen when neighbors help
              neighbors.
            </p>
            <button
              onClick={() =>
                document
                  .getElementById("feed")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Find your way to help <ArrowUpRight size={17} />
            </button>
            <div className="hero-social">
              <div className="avatar-stack">
                {s.users.slice(0, 3).map((u) => (
                  <Avatar key={u.id} user={u} size="small" />
                ))}
              </div>
              <span>Better together, right here in Old Town.</span>
            </div>
          </div>
          <NeighborhoodArt />
        </section>
      )}
      <div className="stats-row">
        {[
          {
            icon: Users,
            num: "248",
            label: "neighbors connected",
            note: "One welcoming community",
          },
          {
            icon: HandHeart,
            num: String(
              18 + s.posts.filter((p) => p.status === "Completed").length,
            ),
            label: "helping hands this month",
            note: "Little moments, lasting impact",
          },
          {
            icon: Sprout,
            num: String(
              s.posts.filter(
                (p) => p.kind === "Help request" && p.status === "Open",
              ).length,
            ),
            label: "opportunities to help",
            note: "Your next good deed is here",
          },
        ].map(({ icon: Icon, num, label, note }) => (
          <div key={label} className="stat">
            <span className="stat-icon">
              <Icon size={23} />
            </span>
            <div>
              <strong>{num}</strong>
              <span>{label}</span>
              <small>{note}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="content-columns" id="feed">
        <section className="feed-column">
          <div className="section-heading">
            <h2>
              {help ? "Find your next good deed" : "Around the neighborhood"}
            </h2>
            <span className="tiny-tag">{n}</span>
          </div>
          <div className="composer">
            <Avatar user={u} />
            <button disabled={!visible} onClick={() => onCompose("PSA")}>
              What’s happening in your neighborhood?
            </button>
            <button
              className="icon-button"
              aria-label="Create post"
              disabled={!visible}
              onClick={() => onCompose("PSA")}
            >
              <Plus size={21} />
            </button>
          </div>
          <div className="filter-tabs">
            {tabs.map((t) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="search-row">
            <div className="search">
              <Search size={17} />
              <input
                placeholder="Search your neighborhood"
                aria-label="Search your neighborhood"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <SlidersHorizontal size={17} />
            <select
              aria-label="Category filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="secondary-filters">
            <select
              aria-label="Group filter"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="">All groups</option>
              {s.groups
                .filter((g) => g.approved)
                .map((g) => (
                  <option key={g.name}>{g.name}</option>
                ))}
            </select>
            <select
              aria-label="Task status filter"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Any task status</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span>{posts.length} posts</span>
          </div>
          <div className="post-list">
            {posts.length ? (
              posts.map((p) => (
                <PostCard key={p.id} p={p} onOpen={() => open(p.id)} />
              ))
            ) : (
              <Empty title="No posts found">
                Try another search or filter. There’s always a new connection
                around the corner.
              </Empty>
            )}
          </div>
        </section>
        <aside className="right-rail">
          <section className="rail-card intention">
            <div className="section-heading">
              <span className="mini-icon">
                <HandHeart size={19} />
              </span>
              <span className="eyebrow">MAKE SOMEONE’S DAY</span>
            </div>
            <h3>
              You don’t need a lot
              <br />
              to mean a lot.
            </h3>
            <p>
              A few minutes, a spare tool, a skill you take for granted. It all
              counts.
            </p>
            <button disabled={!visible} onClick={() => onCompose("Offer help")}>
              Offer a helping hand <ArrowUpRight size={16} />
            </button>
          </section>
          <section className="rail-card">
            <div className="section-heading">
              <h3>Your local circles</h3>
            </div>
            <p className="muted">Find your people, close to home.</p>
            {s.groups
              .filter((g) => g.approved && g.neighborhood === n)
              .slice(0, 3)
              .map((g) => (
                <GroupLink key={g.name} name={g.name} icon={g.icon} />
              ))}
            <GoTo view="Groups">
              Explore all groups <ArrowUpRight size={14} />
            </GoTo>
          </section>
          <section className="rail-card neighbor-spotlight">
            <span className="eyebrow">A LITTLE NEIGHBOR APPRECIATION</span>
            <div className="spotlight-flower">✺</div>
            <Avatar user={s.users[2]} />
            <h3>Here’s to June.</h3>
            <p>
              12 helping hands lent.
              <br />
              Countless smiles made.
            </p>
            <GoTo view="Leaderboard">
              Meet your community helpers <ArrowUpRight size={14} />
            </GoTo>
          </section>
          <div className="rail-foot">
            <ShieldCheck size={17} />
            <p>
              A space for neighbors.
              <br />
              Always local. Always kind.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

export function GroupLink({ name, icon }: { name: string; icon: string }) {
  const { setView, s } = useApp();
  return (
    <button className="group-link" onClick={() => setView("Groups")}>
      <span>{icon}</span>
      <div>
        <strong>{name}</strong>
        <small>
          {s.users.filter((u) => u.groups.includes(name)).length + 20} neighbors
        </small>
      </div>
      <ChevronRight size={15} />
    </button>
  );
}

export function NeighborhoodArt() {
  return (
    <div
      className="neighborhood-art"
      aria-label="Illustration of a friendly tree-lined neighborhood"
      role="img"
    >
      <svg viewBox="0 0 480 290" fill="none">
        <circle cx="303" cy="113" r="104" fill="#e3dfb6" />
        <circle cx="391" cy="49" r="26" fill="#f0ca75" />
        <path
          d="M22 258C88 220 167 231 220 247C301 219 381 223 480 251V290H22Z"
          fill="#aebc90"
        />
        <path d="M110 290C210 246 316 253 350 290" fill="#f3d6a4" />
        <path d="M33 120L117 59L198 120" fill="#be7359" />
        <path d="M48 119H185V241H48Z" fill="#f0d4ae" />
        <path
          d="M37 120L117 65L196 120"
          stroke="#704f41"
          strokeWidth="9"
          strokeLinejoin="round"
        />
        <path d="M66 139H99V177H66Z" fill="#6c8d80" />
        <path d="M81 139V177M66 157H99" stroke="#f9e9cb" strokeWidth="4" />
        <path d="M129 139H162V177H129Z" fill="#6c8d80" />
        <path d="M145 139V177M129 157H162" stroke="#f9e9cb" strokeWidth="4" />
        <path d="M100 191H135V242H100Z" fill="#6f8c70" />
        <circle cx="126" cy="219" r="2" fill="#f8d797" />
        <path d="M151 80V50H168V95" fill="#d7b58c" />
        <path d="M248 136L321 85L390 136V245H248Z" fill="#f8e7c6" />
        <path
          d="M237 137L320 77L403 138"
          stroke="#637b66"
          strokeWidth="10"
          strokeLinejoin="round"
        />
        <path d="M272 154H301V187H272Z" fill="#9fb8a4" />
        <path d="M287 154V187M272 170H301" stroke="#fff4df" strokeWidth="3" />
        <path d="M336 154H365V187H336Z" fill="#9fb8a4" />
        <path d="M350 154V187M336 170H365" stroke="#fff4df" strokeWidth="3" />
        <path d="M311 203H340V246H311Z" fill="#bb765a" />
        <path d="M205 238V109" stroke="#786347" strokeWidth="9" />
        <ellipse cx="205" cy="93" rx="38" ry="55" fill="#77976a" />
        <ellipse cx="186" cy="118" rx="28" ry="34" fill="#8da676" />
        <path d="M433 244V145" stroke="#786347" strokeWidth="8" />
        <ellipse cx="432" cy="117" rx="34" ry="57" fill="#678c69" />
        <path
          d="M15 244H79M23 227V260M42 227V255M62 227V250M366 248H475M377 230V262M400 231V267M424 233V273M449 232V273M470 235V275"
          stroke="#f7ebcf"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <ellipse cx="235" cy="250" rx="17" ry="10" fill="#668864" />
        <ellipse cx="187" cy="251" rx="21" ry="12" fill="#6a8d64" />
        <ellipse cx="77" cy="248" rx="21" ry="12" fill="#7d9a6d" />
        <circle cx="212" cy="211" r="9" fill="#b77c59" />
        <path d="M207 223H219L227 249H201Z" fill="#dba75c" />
        <path
          d="M208 248V268M219 248V266"
          stroke="#4c6558"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M205 229L189 242M220 229L234 239"
          stroke="#b77c59"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <circle cx="264" cy="219" r="8" fill="#daa27b" />
        <path d="M257 230H270L276 252H251Z" fill="#577b69" />
        <path
          d="M256 252V268M269 252V269"
          stroke="#6e584b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M256 233L244 243"
          stroke="#daa27b"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M354 33q7-9 14 0q7-9 14 0M57 55q7-9 14 0q7-9 14 0"
          stroke="#8e9b7f"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="art-label">
        <Heart size={13} /> A little closer to home.
      </span>
    </div>
  );
}

export function PostCard({ p, onOpen }: { p: Post; onOpen: () => void }) {
  const { s, u, mutate } = useApp();
  const author = s.users.find((u) => u.id === p.author)!;
  return (
    <article className="post-card">
      <div className="post-top">
        <Avatar user={author} />
        <div className="post-author">
          <strong>{author.name}</strong>
          <small>
            {p.group || p.neighborhood} <span>·</span>{" "}
            {p.id.length > 10 ? "Just now" : "2 hours ago"}
          </small>
        </div>
        <span className={`kind-tag kind-${p.kind.replaceAll(" ", "-")}`}>
          {p.kind === "Help request"
            ? "A little help needed"
            : p.kind === "Offer help"
              ? "Happy to help"
              : p.kind}
        </span>
      </div>
      <button className="post-title" onClick={onOpen}>
        <h3>{p.title}</h3>
      </button>
      <p className="post-description">{p.description}</p>
      {p.photo && (
        <div
          className={`post-photo ${p.photo === "books" ? "book-photo" : p.photo === "garden" ? "garden-photo" : ""}`}
        >
          {p.photo.startsWith("data:") ? (
            <img src={p.photo} alt="Neighbor’s post attachment" />
          ) : p.photo === "books" ? (
            <div className="book-stack">
              {[
                "#b27655",
                "#e4c48d",
                "#728d7c",
                "#d8a66d",
                "#677d81",
                "#cda88c",
              ].map((c, i) => (
                <span
                  key={c}
                  style={{
                    background: c,
                    width: `${45 + i * 7}px`,
                    height: `${100 + (i % 3) * 17}px`,
                    transform: `rotate(${i % 2 ? 3 : -4}deg)`,
                  }}
                >
                  <i />
                  {
                    [
                      "STORIES",
                      "GROW",
                      "THE ART OF SLOW",
                      "HOME",
                      "WANDER",
                      "COOK",
                    ][i]
                  }
                </span>
              ))}
            </div>
          ) : (
            <div className="garden-illustration">
              🌿 <span>good things take thyme.</span> 🌱
            </div>
          )}
        </div>
      )}
      <div className="post-meta">
        <span>
          <MapPin size={13} />
          {p.location}
        </span>
        <span>
          <Leaf size={13} />
          {p.category}
        </span>
        {p.kind === "Help request" && (
          <span className="status-dot">{p.status}</span>
        )}
      </div>
      <div className="post-bottom">
        <div className="reactions">
          <button
            aria-label={`Upvote ${p.title}`}
            aria-pressed={p.votes[u.id] === 1}
            onClick={() => mutate((s) => vote(s, p.id, u.id, 1))}
          >
            <ArrowUp size={16} />
            {Object.values(p.votes).reduce((a, b) => a + b, 0)}
          </button>
          <button
            aria-label={`Downvote ${p.title}`}
            aria-pressed={p.votes[u.id] === -1}
            onClick={() => mutate((s) => vote(s, p.id, u.id, -1))}
          >
            <ArrowDown size={15} />
          </button>
          <button onClick={onOpen}>
            <MessageCircle size={15} />
            {p.comments.length}
            <span> comments</span>
          </button>
        </div>
        <button className="post-cta" onClick={onOpen}>
          {p.kind === "Help request" ? "Lend a hand" : "Take a look"}
          <ArrowUpRight size={15} />
        </button>
      </div>
    </article>
  );
}
