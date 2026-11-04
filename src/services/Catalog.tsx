import { useState } from "react";
import {
  DoorOpen,
  Palette,
  Bus,
  HandHeart,
  Heart,
  Package,
  ArrowUpRight,
  Search,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Sprout,
} from "lucide-react";
import type { Service, CatalogItem } from "./model";
import { money, remainingSeats, classSeats } from "./model";
import { useServices } from "./context";
import { PageTitle, Calendar, CenterArt } from "./ui";
export const serviceCards = [
  {
    view: "Rooms",
    icon: DoorOpen,
    title: "Reserve a Room",
    description:
      "Book event space with optional catering, cleaning, and equipment.",
    tag: "ROOMS",
    action: "Reserve a room",
  },
  {
    view: "Classes",
    icon: Palette,
    title: "Take or Teach a Class",
    description: "Enroll in a class or submit a class to teach.",
    tag: "CLASSES",
    action: "View classes",
  },
  {
    view: "Transportation",
    icon: Bus,
    title: "Shuttle and Ride Services",
    description: "Reserve a scheduled shuttle, request a ride, or drive.",
    tag: "TRANSPORTATION",
    action: "View transportation",
  },
  {
    view: "Home Care",
    icon: HandHeart,
    title: "Request or Provide Home Care",
    description: "Book in-home care or submit caregiver availability.",
    tag: "HOME CARE",
    action: "View home care",
  },
  {
    view: "Donations",
    icon: Heart,
    title: "Make a Donation",
    description: "Donate anonymously or with an account.",
    tag: "DONATIONS",
    action: "Donate",
  },
] as const;
const serviceIcons = {
  room: DoorOpen,
  class: Palette,
  shuttle: Bus,
  ride: Bus,
  care: HandHeart,
};
export function Home() {
  const { setView } = useServices();
  const [q, setQ] = useState("");
  const cards = serviceCards.filter((c) =>
    `${c.view} ${c.description}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        eyebrow="BEST COMMUNITY SERVICE"
        title="Community Services"
        description="Browse services, make reservations, or volunteer."
      />
      <section className="hero service-hero">
        <div className="hero-copy">
          <span className="pill">
            <span className="live-dot" /> SERVICES AND VOLUNTEERING
          </span>
          <h2>
            Book a service.
            <br />
            <em>Volunteer.</em>
          </h2>
          <p>
            Reserve rooms, enroll in classes, arrange transportation, or request
            home care.
          </p>
          <button
            onClick={() =>
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            View services <ArrowUpRight size={17} />
          </button>
          <span className="hero-caption">
            <Sprout size={16} /> Volunteer to teach, drive, or provide home
            care.
          </span>
        </div>
        <CenterArt />
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">SELECT A SERVICE</span>
          <h2>Services</h2>
        </div>
        <label className="service-search">
          <Search size={17} />
          <input
            aria-label="Search services"
            placeholder="Search services"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      <div id="services" className="service-grid">
        {cards.map(({ view, icon: Icon, title, description, tag, action }) => (
          <article className="service-card" key={view}>
            <span className="service-icon">
              <Icon size={25} />
            </span>
            <span className="eyebrow">{tag}</span>
            <h2>{title}</h2>
            <p>{description}</p>
            <button className="text-button" onClick={() => setView(view)}>
              {action} <ArrowUpRight size={16} />
            </button>
          </article>
        ))}
        {!cards.length && <p>No services match your search.</p>}
      </div>
      <section className="package-banner">
        <span className="service-icon">
          <Package />
        </span>
        <div>
          <span className="eyebrow">PACKAGES</span>
          <h2>Room or Class + Shuttle</h2>
          <p>
            Pair your room or class with a shuttle. Enter shared details just
            once.
          </p>
        </div>
        <button className="secondary" onClick={() => setView("Packages")}>
          View packages <ArrowUpRight size={16} />
        </button>
      </section>
    </>
  );
}
export function Packages() {
  const { act } = useServices();
  return (
    <>
      <PageTitle
        eyebrow="PACKAGES"
        title="Service Packages"
        description="Book a room or class with transportation, and share your details just once."
      />
      <div className="service-grid two">
        {[
          {
            kind: "package-room",
            title: "Room + Shuttle",
            copy: "Reserve event space and shuttle seats.",
            Icon: DoorOpen,
          },
          {
            kind: "package-class",
            title: "Classes + Shuttle",
            copy: "Enroll in a class and reserve shuttle seats.",
            Icon: Palette,
          },
        ].map(({ kind, title, copy, Icon }) => (
          <article className="service-card" key={kind}>
            <span className="service-icon">
              <Icon />
            </span>
            <span className="eyebrow">COMMUNITY PACKAGE</span>
            <h2>{title}</h2>
            <p>{copy}</p>
            <ol className="package-steps">
              <li>
                Choose your{" "}
                {kind === "package-room"
                  ? "room and optional add-ons"
                  : "class session"}
                .
              </li>
              <li>Select a shuttle and passenger count.</li>
              <li>Review both and confirm in one flow.</li>
            </ol>
            <button
              className="primary"
              onClick={() =>
                act({
                  type: "booking",
                  kind: kind as "package-room" | "package-class",
                })
              }
            >
              Book {title} <ArrowUpRight size={15} />
            </button>
          </article>
        ))}
      </div>
      <p className="service-footnote">
        Package prices are the sum of the selected services. No additional
        package fee.
      </p>
    </>
  );
}
export function Catalog({ kind }: { kind: Service | "transportation" }) {
  const { state, act } = useServices();
  const [q, setQ] = useState(""),
    [detail, setDetail] = useState<CatalogItem | null>(null),
    [date, setDate] = useState(""),
    [transport, setTransport] = useState<"shuttle" | "ride">("shuttle");
  const actual = kind === "transportation" ? transport : kind;
  const config = {
    room: {
      title: "Reserve a Room",
      copy: "Choose a room, date, and time. Add optional services.",
      eyebrow: "ROOMS",
    },
    class: {
      title: "Classes",
      copy: "Enroll in an available class or submit a class to teach.",
      eyebrow: "CLASSES",
    },
    shuttle: {
      title: "Transportation",
      copy: "Choose a scheduled shuttle or request an on-demand ride.",
      eyebrow: "TRANSPORTATION",
    },
    ride: {
      title: "Transportation",
      copy: "Choose a scheduled shuttle or request an on-demand ride.",
      eyebrow: "TRANSPORTATION",
    },
    care: {
      title: "Home Care",
      copy: "In-home support for elderly people and people with disabilities.",
      eyebrow: "HOME CARE",
    },
  }[actual];
  const list = state.catalog.filter(
    (c) =>
      c.kind === actual &&
      `${c.title} ${c.description}`.toLowerCase().includes(q.toLowerCase()),
  );
  if (detail) {
    const c = state.catalog.find((x) => x.id === detail.id)!;
    const Icon = serviceIcons[c.kind];
    return (
      <>
        <button
          className="text-button back-link"
          onClick={() => setDetail(null)}
        >
          <ArrowLeft size={15} />
          Back to{" "}
          {kind === "transportation"
            ? "transportation"
            : kind === "class"
              ? "classes"
              : kind === "care"
                ? "home care"
                : "rooms"}
        </button>
        <PageTitle
          eyebrow={config.eyebrow}
          title={c.title}
          description={c.description}
        />
        <div className="detail-layout">
          <section className="panel service-detail">
            <span className="service-icon large">
              <Icon size={38} />
            </span>
            <h2>
              {c.kind === "room"
                ? "Room details"
                : c.kind === "class"
                  ? "Class details"
                  : c.kind === "care"
                    ? "Home-care details"
                    : "Transportation details"}
            </h2>
            <dl className="detail-facts">
              <div>
                <dt>Location</dt>
                <dd>{c.location}</dd>
              </div>
              <div>
                <dt>
                  {c.kind === "shuttle" ? "Departure / arrival" : "Hours"}
                </dt>
                <dd>
                  {c.start} – {c.end}
                </dd>
              </div>
              <div>
                <dt>Sample price</dt>
                <dd>
                  {money(state.prices[c.id])} / {c.unit}
                </dd>
              </div>
              {(c.kind === "room" || c.kind === "class") && (
                <div>
                  <dt>Capacity</dt>
                  <dd>{c.capacity} people</dd>
                </div>
              )}
              {c.kind === "shuttle" && (
                <div>
                  <dt>Route</dt>
                  <dd>{c.description}</dd>
                </div>
              )}
              {c.kind === "class" && (
                <>
                  <div>
                    <dt>Language</dt>
                    <dd>{c.language}</dd>
                  </div>
                  <div>
                    <dt>Level</dt>
                    <dd>{c.level}</dd>
                  </div>
                  <div>
                    <dt>Prerequisites</dt>
                    <dd>{c.prerequisites}</dd>
                  </div>
                  <div>
                    <dt>Teacher</dt>
                    <dd>Community volunteer</dd>
                  </div>
                </>
              )}
            </dl>
            {c.kind === "room" && (
              <p className="soft-note">
                Optional catering, cleaning, tables, and chairs are available
                during your reservation.
              </p>
            )}
            {c.kind === "ride" && (
              <p className="soft-note">
                Submitting a request does not assign a driver or guarantee a
                ride.
              </p>
            )}
            <button
              className="primary"
              onClick={() =>
                act({
                  type: "booking",
                  kind: c.kind,
                  itemId: c.id,
                  date: date || c.dates[0],
                })
              }
            >
              {c.kind === "room"
                ? "Reserve room"
                : c.kind === "class"
                  ? "Enroll in class"
                  : c.kind === "care"
                    ? "Request home care"
                    : c.kind === "ride"
                      ? "Request a ride"
                      : "Reserve shuttle"}
              <ArrowUpRight size={16} />
            </button>
          </section>
          <section className="panel">
            <Calendar
              dates={c.dates}
              value={date || c.dates[0]}
              onChange={setDate}
              label="Browse availability"
            />
            {c.kind === "shuttle" && (
              <p className="soft-note">
                {remainingSeats(state, c.id, date || c.dates[0])} seats
                available on the selected date.
              </p>
            )}
            {c.kind === "class" && (
              <p className="soft-note">
                {classSeats(state, c.id, date || c.dates[0])} places available
                on the selected date. Enrollment is for one session.
              </p>
            )}
          </section>
        </div>
      </>
    );
  }
  return (
    <>
      <PageTitle
        eyebrow={config.eyebrow}
        title={config.title}
        description={config.copy}
      >
        {kind === "class" && (
          <button
            className="primary"
            onClick={() => act({ type: "offering", kind: "class" })}
          >
            Teach a class <ArrowUpRight size={16} />
          </button>
        )}
        {kind === "transportation" && (
          <button
            className="primary"
            onClick={() => act({ type: "offering", kind: "driver" })}
          >
            Volunteer to drive <ArrowUpRight size={16} />
          </button>
        )}
        {kind === "care" && (
          <button
            className="primary"
            onClick={() => act({ type: "offering", kind: "care" })}
          >
            Provide home care <ArrowUpRight size={16} />
          </button>
        )}
      </PageTitle>
      <div className="catalog-toolbar">
        {kind === "transportation" ? (
          <div className="service-tabs">
            <button
              className={transport === "shuttle" ? "selected" : ""}
              onClick={() => setTransport("shuttle")}
            >
              Scheduled shuttles
            </button>
            <button
              className={transport === "ride" ? "selected" : ""}
              onClick={() => setTransport("ride")}
            >
              On-demand rides
            </button>
          </div>
        ) : (
          <p className="muted">
            {kind === "class"
              ? "TAKE A CLASS"
              : kind === "care"
                ? "FIND HOME CARE"
                : "AVAILABLE ROOMS"}
          </p>
        )}
        <label className="service-search">
          <Search size={17} />
          <input
            aria-label="Search offerings"
            placeholder={`Search ${actual === "class" ? "classes" : "services"}`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      <div className="service-grid two">
        {list.map((c) => {
          const Icon = serviceIcons[c.kind];
          return (
            <article className="service-card listing-card" key={c.id}>
              <div className={`listing-art art-${c.kind}`}>
                <Icon size={62} strokeWidth={1} />
                <span>
                  {c.kind === "class"
                    ? "VOLUNTEER LED"
                    : c.kind === "room"
                      ? "EVENT SPACE"
                      : c.kind === "care"
                        ? "IN-HOME CARE"
                        : "TRANSPORTATION"}
                </span>
              </div>
              <div className="listing-body">
                <span className="eyebrow">
                  {c.kind === "class"
                    ? c.level
                    : c.kind === "shuttle"
                      ? "SCHEDULED SERVICE"
                      : "BEST COMMUNITY SERVICE"}
                </span>
                <h2>{c.title}</h2>
                <p>{c.description}</p>
                <div className="listing-meta">
                  <span>
                    <MapPin size={14} />
                    {c.location}
                  </span>
                  <span>
                    <Clock size={14} />
                    {c.start}–{c.end}
                  </span>
                  {c.kind === "room" && (
                    <span>
                      <Users size={14} />
                      Up to {c.capacity}
                    </span>
                  )}
                </div>
                <div className="listing-bottom">
                  <strong>
                    {state.prices[c.id] === 0
                      ? "Free"
                      : money(state.prices[c.id])}
                    <small> / {c.unit}</small>
                  </strong>
                  <button
                    className="text-button"
                    aria-label={`View ${c.title}`}
                    onClick={() => {
                      setDetail(c);
                      setDate(c.dates[0]);
                    }}
                  >
                    View details <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {!list.length && (
        <section className="panel empty">
          <h2>No services match your search.</h2>
          <p>Try another keyword.</p>
        </section>
      )}
      <p className="service-footnote">
        All availability and prices are fictional examples for this interactive
        prototype.
      </p>
    </>
  );
}
