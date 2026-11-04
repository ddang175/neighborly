import { useEffect, useState } from "react";
import {
  Leaf,
  Home as HomeIcon,
  DoorOpen,
  Palette,
  Bus,
  HandHeart,
  Heart,
  Package,
  Settings2,
  Menu,
  ChevronRight,
  LogOut,
  ArrowUpRight,
  Flower2,
  Check,
  X,
  RotateCcw,
} from "lucide-react";
import { createState } from "./services/model";
import type { AppState, User } from "./services/model";
import { ServiceContext } from "./services/context";
import type { View, Action } from "./services/context";
import { Home, Catalog, Packages } from "./services/Catalog";
import { Booking } from "./services/Booking";
import { Offering } from "./services/Offering";
import { DonationLanding, Donations } from "./services/Donations";
import { Admin } from "./services/Admin";
import { Auth } from "./Auth";

const navItems = [
  { name: "Home", icon: HomeIcon },
  { name: "Rooms", icon: DoorOpen },
  { name: "Classes", icon: Palette },
  { name: "Transportation", icon: Bus },
  { name: "Home Care", icon: HandHeart },
  { name: "Donations", icon: Heart },
  { name: "Packages", icon: Package },
] as const;
export default function App() {
  const [state, setState] = useState<AppState>(createState),
    [uid, setUid] = useState(""),
    [view, setView] = useState<View>("Home"),
    [action, setAction] = useState<Action | null>(null),
    [auth, setAuth] = useState<false | "user" | "admin">(false),
    [pending, setPending] = useState<Action | null>(null),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState("");
  const user = state.users.find((u) => u.id === uid);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  function nav(v: View) {
    setView(v);
    setAction(null);
    setMobile(false);
    window.scrollTo(0, 0);
  }
  function act(a: Action) {
    if (!user && !(a.type === "donation" && a.anonymous)) {
      setPending(a);
      setAuth("user");
      return;
    }
    setAction(a);
    window.scrollTo(0, 0);
  }
  function login(id: string) {
    setUid(id);
    if (auth === "admin") {
      nav("Mock Admin");
      setPending(null);
    } else if (pending) {
      setAction(pending);
      setPending(null);
    }
    setAuth(false);
  }
  function register(u: User) {
    setState((s) => ({ ...s, users: [...s.users, u] }));
    setUid(u.id);
    if (pending) setAction(pending);
    setPending(null);
    setAuth(false);
  }
  function logout() {
    setUid("");
    setAction(null);
    if (view === "Mock Admin") setView("Home");
    setToast("You’re signed out. You can keep browsing.");
  }
  function reset() {
    if (
      window.confirm(
        "Reset all sample bookings, submissions, accounts, and prices?",
      )
    ) {
      setState(createState());
      setUid("");
      setPending(null);
      setAction(null);
      setAuth(false);
      setView("Home");
      setToast("Prototype reset.");
    }
  }
  const done = () => {
    setAction(null);
    window.scrollTo(0, 0);
  };
  return (
    <ServiceContext.Provider
      value={{
        state,
        user,
        view,
        setView: nav,
        update: (fn) => {
          const next = fn(state);
          setState(next);
        },
        act,
        notify: setToast,
      }}
    >
      {auth ? (
        <Auth
          admin={auth === "admin"}
          onLogin={login}
          onRegister={register}
          onCancel={() => {
            setAuth(false);
            setPending(null);
          }}
        />
      ) : (
        <>
          <div className="demo-bar">
            <span>
              <span className="live-dot" /> INTERACTIVE PROTOTYPE
              <span className="demo-note">
                · Sample data. Simulated payments.
              </span>
            </span>
            <div>
              <button
                onClick={() => {
                  if (user?.admin) nav("Mock Admin");
                  else {
                    setPending(null);
                    setAuth("admin");
                  }
                }}
              >
                <Settings2 size={13} />
                Mock Admin
              </button>
              <button onClick={reset}>
                <RotateCcw size={13} />
                Reset demo
              </button>
            </div>
          </div>
          {mobile && (
            <button
              className="mobile-scrim"
              aria-label="Close navigation"
              onClick={() => setMobile(false)}
            />
          )}
          <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
            <a
              className="brand"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                nav("Home");
              }}
            >
              <span className="brand-mark">
                <Leaf size={25} />
              </span>
              <span className="brand-name">
                Best Community Service<span className="brand-dot">.</span>
              </span>
            </a>
            <div className="center-location">
              <span className="eyebrow">COMMUNITY CENTER</span>
              <strong>Ames, Iowa</strong>
              <small>Nonprofit services</small>
            </div>
            <nav aria-label="Main navigation">
              <small className="nav-label">SERVICES</small>
              {navItems.map(({ name, icon: Icon }) => (
                <button
                  key={name}
                  className={view === name ? "active" : ""}
                  onClick={() => nav(name)}
                >
                  <Icon size={19} />
                  {name}
                </button>
              ))}
              {user?.admin && (
                <>
                  <small className="nav-label second">PROTOTYPE TOOLS</small>
                  <button
                    className={view === "Mock Admin" ? "active" : ""}
                    onClick={() => nav("Mock Admin")}
                  >
                    <Settings2 size={19} />
                    Mock Admin
                  </button>
                </>
              )}
            </nav>
            <div className="sidebar-note">
              <span>VOLUNTEER</span>
              <Flower2 size={34} />
              <p>Teach a class, drive, or provide home care.</p>
              <button onClick={() => nav("Classes")}>
                View classes
                <ArrowUpRight size={15} />
              </button>
            </div>
            <div className="account">
              <span className="avatar">
                {user
                  ? user.name
                      .split(" ")
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join("")
                  : "BC"}
              </span>
              <div className="account-copy">
                <strong>{user?.name || "Guest"}</strong>
                <small>
                  {user?.admin
                    ? "Mock administrator"
                    : user
                      ? "Registered community member"
                      : "Browse as a guest"}
                </small>
              </div>
              {user ? (
                <button
                  className="icon-button"
                  aria-label="Log out"
                  onClick={logout}
                >
                  <LogOut size={17} />
                </button>
              ) : (
                <button className="text-button" onClick={() => setAuth("user")}>
                  Log in
                </button>
              )}
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
                  Best Community Service · Ames, IA
                </span>
                {user ? (
                  <span className="user-badge">
                    {user.admin ? "Mock Admin" : user.name}
                  </span>
                ) : (
                  <button className="secondary" onClick={() => setAuth("user")}>
                    Log in / Sign up
                  </button>
                )}
              </div>
            </header>
            <main>
              {action?.type === "booking" ? (
                <Booking
                  key={`${action.kind}-${action.itemId || ""}`}
                  kind={action.kind}
                  itemId={action.itemId}
                  initialDate={action.date}
                  onDone={done}
                />
              ) : action?.type === "offering" ? (
                <Offering kind={action.kind} onDone={done} />
              ) : action?.type === "donation" ? (
                <Donations anonymous={action.anonymous} onDone={done} />
              ) : (
                <>
                  {view === "Home" && <Home />}
                  {view === "Rooms" && <Catalog key="rooms" kind="room" />}
                  {view === "Classes" && <Catalog key="classes" kind="class" />}
                  {view === "Transportation" && (
                    <Catalog key="transport" kind="transportation" />
                  )}
                  {view === "Home Care" && <Catalog key="care" kind="care" />}
                  {view === "Donations" && <DonationLanding />}
                  {view === "Packages" && <Packages />}
                  {view === "Mock Admin" && <Admin />}
                </>
              )}
              <footer>
                <span>
                  <Leaf size={13} />
                  Best Community Service · Ames, Iowa
                </span>
                <span>Community services · Sample data · No real payments</span>
              </footer>
            </main>
          </div>
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
    </ServiceContext.Provider>
  );
}
