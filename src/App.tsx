import { useState, useEffect } from "react";

import {
  Home,
  HandHeart,
  ClipboardList,
  MessageCircle,
  Users,
  Trophy,
  UserRound,
  Settings,
  ShieldCheck,
  Leaf,
  Bell,
  MapPin,
  Clock,
  ArrowUpRight,
  X,
  ChevronRight,
  LogOut,
  Check,
  Flower2,
  Menu,
  RotateCcw,
  LockKeyhole,
} from "lucide-react";
import { seed } from "./model";
import type { State } from "./model";

import { Context } from "./context";
import { Avatar, NeighborhoodOptions } from "./ui";
import { Feed } from "./Feed";
import { PostDetail, PostForm } from "./Posts";
import { Groups } from "./Groups";
import { Tasks, Leaderboard, Alerts } from "./Activity";
import { Profile, Preferences, Membership } from "./Account";
import { Messages } from "./Messages";
import { Moderation } from "./Moderation";
import { Auth } from "./Auth";
const KEY = "neighborly-v1";
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || "null");
    return s?.users?.length ? s : seed();
  } catch {
    return seed();
  }
}
const iconMap: Record<string, typeof Home> = {
  Neighborhood: Home,
  "Find help": HandHeart,
  "My tasks": ClipboardList,
  Messages: MessageCircle,
  Groups: Users,
  Leaderboard: Trophy,
  "My profile": UserRound,
  Settings: Settings,
  Moderation: ShieldCheck,
};

export default function App() {
  const [s, setS] = useState<State>(load),
    [uid, setUid] = useState(
      () => localStorage.getItem("neighborly-user") || "maya",
    ),
    [view, setView] = useState("Neighborhood"),
    [n, setN] = useState("Old Town"),
    [detail, setDetail] = useState(""),
    [compose, setCompose] = useState(""),
    [toast, setToast] = useState(""),
    [auth, setAuth] = useState(
      () => localStorage.getItem("neighborly-logged-out") === "true",
    ),
    [mobile, setMobile] = useState(false);
  const u = s.users.find((u) => u.id === uid) || s.users[0];
  useEffect(
    () => localStorage.setItem("neighborly-logged-out", String(auth)),
    [auth],
  );
  useEffect(() => localStorage.setItem(KEY, JSON.stringify(s)), [s]);
  useEffect(() => localStorage.setItem("neighborly-user", uid), [uid]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 4500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const mutate = (fn: (s: State) => void, msg?: string) => {
    try {
      const next = structuredClone(s);
      fn(next);
      setS(next);
      if (msg) setToast(msg);
    } catch (e) {
      setToast((e as Error).message);
    }
  };
  const unread = s.alerts.filter(
    (a) => a.user === u.id && !a.read && a.channels.includes("website"),
  ).length;
  const nav = (v: string) => {
    setView(v);
    setMobile(false);
  };
  return (
    <Context.Provider
      value={{
        s,
        u,
        mutate,
        open: setDetail,
        notify: setToast,
        view,
        setView: nav,
        neighborhood: n,
      }}
    >
      {auth ? (
        <Auth
          onLogin={(id) => {
            setUid(id);
            setAuth(false);
            setView("Neighborhood");
            setN(s.users.find((u) => u.id === id)?.neighborhood || "Old Town");
          }}
          onRegister={(user) => {
            mutate((s) => s.users.push(user));
            setUid(user.id);
            setAuth(false);
          }}
        />
      ) : (
        <>
          <div className="demo-bar">
            <span>
              <span className="live-dot" /> INTERACTIVE PROTOTYPE{" "}
              <span className="demo-note">
                · Fictional neighbors. Real community spirit.
              </span>
            </span>
            <div>
              <label>
                Viewing as{" "}
                <select
                  aria-label="Demo account"
                  value={u.id}
                  onChange={(e) => {
                    setUid(e.target.value);
                    if (view === "Moderation") setView("Neighborhood");
                    setN(
                      s.users.find((u) => u.id === e.target.value)!
                        .neighborhood,
                    );
                  }}
                >
                  {s.users.map((u) => (
                    <option value={u.id} key={u.id}>
                      {u.name} ·{" "}
                      {u.membership === "Pending" ? "Pending" : u.role}
                    </option>
                  ))}
                </select>
              </label>
              <button
                title="Reset fictional demo data"
                onClick={() => {
                  setS(seed());
                  setUid("maya");
                  setN("Old Town");
                  setDetail("");
                  setView("Neighborhood");
                  setToast("Demo reset to its starting point");
                }}
              >
                <RotateCcw size={13} /> Reset demo
              </button>
            </div>
          </div>
          <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
            <a
              className="brand"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                nav("Neighborhood");
              }}
            >
              <span className="brand-mark">
                <Leaf size={25} />
              </span>
              neighborly<span className="brand-dot">.</span>
            </a>
            <div className="neighborhood-picker">
              <MapPin size={18} />
              <div>
                <small>YOUR NEIGHBORHOOD</small>
                <select
                  aria-label="Viewing neighborhood"
                  value={n}
                  onChange={(e) => {
                    setN(e.target.value);
                    setDetail("");
                    setView("Neighborhood");
                  }}
                >
                  <NeighborhoodOptions />
                </select>
                <span>Ames, Iowa</span>
              </div>
            </div>
            <nav aria-label="Main navigation">
              <small className="nav-label">YOUR COMMUNITY</small>
              {[
                "Neighborhood",
                "Find help",
                "My tasks",
                "Messages",
                "Groups",
                "Leaderboard",
              ].map((v) => {
                const Icon = iconMap[v];
                return (
                  <button
                    key={v}
                    aria-label={v}
                    className={view === v ? "active" : ""}
                    onClick={() => nav(v)}
                  >
                    <Icon size={19} />
                    {v}
                    {v === "Messages" &&
                      s.dm.some((d) => d.to === u.id && !d.accepted) && (
                        <span className="nav-count">1</span>
                      )}
                  </button>
                );
              })}
              <small className="nav-label second">YOUR SPACE</small>
              {[
                "My profile",
                "Settings",
                ...(["Moderator", "Staff"].includes(u.role)
                  ? ["Moderation"]
                  : []),
              ].map((v) => {
                const Icon = iconMap[v];
                return (
                  <button
                    key={v}
                    aria-label={v}
                    className={view === v ? "active" : ""}
                    onClick={() => nav(v)}
                  >
                    <Icon size={19} />
                    {v}
                  </button>
                );
              })}
            </nav>
            <div className="sidebar-note">
              <span>GOOD THINGS GROW HERE</span>
              <Flower2 size={34} />
              <p>
                A little of your time.
                <br />A lot of difference.
              </p>
              <button onClick={() => nav("Find help")}>
                Lend a hand <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="account">
              <Avatar user={u} />
              <button onClick={() => nav("My profile")}>
                <strong>{u.name}</strong>
                <small>
                  {u.role} · {u.points} points
                </small>
              </button>
              <button
                className="icon-button"
                aria-label="Log out"
                onClick={() => {
                  setAuth(true);
                  setDetail("");
                }}
              >
                <LogOut size={17} />
              </button>
            </div>
          </aside>
          <div className="workspace">
            <header className="topbar">
              <div className="breadcrumb">
                <button
                  className="mobile-toggle icon-button"
                  aria-label="Toggle navigation"
                  onClick={() => setMobile(!mobile)}
                >
                  <Menu />
                </button>
                <span>Our community</span>
                <ChevronRight size={13} />
                <strong>{view}</strong>
              </div>
              <div className="top-actions">
                <span className="location-header">
                  <MapPin size={14} /> Ames, IA
                </span>
                <button
                  className="alert-button"
                  aria-label="Alerts"
                  onClick={() => nav("Alerts")}
                >
                  <Bell size={20} />
                  {unread > 0 && <i />}
                </button>
                <Avatar user={u} size="small" />
              </div>
            </header>
            <main>
              {u.membership !== "Approved" && (
                <div className="notice amber">
                  <Clock size={18} />
                  <div>
                    <strong>
                      {u.membership === "Pending"
                        ? "Your membership is pending"
                        : `Your membership is ${u.membership.toLowerCase()}`}
                    </strong>
                    <span>
                      A neighborhood moderator will review your self-declared
                      membership.
                    </span>
                  </div>
                  <button onClick={() => nav("Membership")}>
                    View status <ArrowUpRight size={14} />
                  </button>
                </div>
              )}
              {n !== u.neighborhood && (
                <div className="notice amber">
                  <LockKeyhole size={18} />
                  <strong>Join this neighborhood to participate</strong>
                  <button onClick={() => nav("Membership")}>Membership</button>
                </div>
              )}
              {view === "Neighborhood" && <Feed onCompose={setCompose} />}
              {view === "Find help" && <Feed help onCompose={setCompose} />}
              {view === "My tasks" && <Tasks />}
              {view === "Groups" && <Groups />}
              {view === "Leaderboard" && <Leaderboard />}
              {view === "My profile" && <Profile />}
              {view === "Settings" && <Preferences />}
              {view === "Alerts" && <Alerts />}
              {view === "Messages" && <Messages />}
              {view === "Membership" && <Membership />}
              {view === "Moderation" &&
                ["Moderator", "Staff"].includes(u.role) && <Moderation />}
              <footer>
                <span>
                  <Leaf size={13} /> Built on kindness. Rooted in Ames.
                </span>
                <span>Community guidelines · Free help, always.</span>
              </footer>
            </main>
          </div>
          {compose && (
            <PostForm kind={compose} onClose={() => setCompose("")} />
          )}{" "}
          {detail && s.posts.some((p) => p.id === detail) && (
            <PostDetail id={detail} onClose={() => setDetail("")} />
          )}
        </>
      )}
      {toast && (
        <div role="status" className="toast">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
