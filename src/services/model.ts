export type Service = "room" | "class" | "shuttle" | "ride" | "care";
export type BookingKind = Service | "package-room" | "package-class";
export type VolunteerActivity = "Teach" | "Drive" | "Give Home Care";
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address: string;
  activities: VolunteerActivity[];
  admin?: boolean;
}
export interface CatalogItem {
  id: string;
  kind: Service;
  title: string;
  description: string;
  capacity: number;
  dates: string[];
  start: string;
  end: string;
  location: string;
  unit: string;
  prerequisites?: string;
  language?: string;
  level?: string;
}
export interface BookingDraft {
  kind: BookingKind;
  itemId: string;
  date: string;
  start?: string;
  end?: string;
  event?: string;
  people?: number;
  catering?: number;
  cleaning?: boolean;
  tables?: number;
  chairs?: number;
  tripId?: string;
  passengers?: number;
  pickup?: string;
  destination?: string;
  recipient?: string;
  address?: string;
  notes?: string;
}
export interface Offering {
  id: string;
  userId: string;
  kind: "class" | "driver" | "care";
  title: string;
  date: string;
  start: string;
  end: string;
  description: string;
  qualifications: string;
  prerequisites?: string;
  language?: string;
  level?: string;
  recurring?: boolean;
  until?: string;
  modes?: string[];
  services?: string[];
  status: "Submitted" | "Approved";
}
export type OfferingInput = Omit<Offering, "id" | "userId" | "status">;
export interface Booking {
  id: string;
  userId: string;
  draft: BookingDraft;
  total: number;
  lines: PriceLine[];
  status: "Confirmed" | "Request submitted";
}
export interface PriceLine {
  label: string;
  amount: number;
}
export interface Donor {
  name: string;
  email: string;
  address: string;
}
export interface Donation {
  id: string;
  amount: number;
  anonymous: boolean;
  userId?: string;
  donor?: Donor;
}
export interface AppState {
  users: User[];
  catalog: CatalogItem[];
  prices: Record<string, number>;
  offerings: Offering[];
  bookings: Booking[];
  donations: Donation[];
}
export const money = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    n,
  );
export function dayOffset(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function classDates(first: string, until?: string): string[] {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(first) ||
    !Number.isFinite(Date.parse(first)) ||
    (until && (until < first || !Number.isFinite(Date.parse(until))))
  )
    throw Error(
      "Choose valid recurrence dates; end date must follow the first date.",
    );
  if (!until) return [first];
  const dates: string[] = [];
  let d = first;
  while (d <= until && dates.length < 104) {
    dates.push(d);
    d = dayOffset(d, 7);
  }
  if (d <= until)
    throw Error("Limit the sample recurring schedule to two years.");
  return dates;
}
export function createState(first = dayOffset(today(), 1)): AppState {
  const dates = Array.from({ length: 28 }, (_, i) => dayOffset(first, i));
  const item = (
    id: string,
    kind: Service,
    title: string,
    description: string,
    capacity: number,
    start: string,
    end: string,
    location: string,
    unit: string,
    extra: Partial<CatalogItem> = {},
  ): CatalogItem => ({
    id,
    kind,
    title,
    description,
    capacity,
    dates: [...dates],
    start,
    end,
    location,
    unit,
    ...extra,
  });
  return {
    users: [
      {
        id: "maya",
        name: "Maya Chen",
        email: "maya@example.test",
        password: "neighborly",
        address: "142 Sample Lane, Ames, IA",
        activities: ["Teach", "Drive", "Give Home Care"],
      },
      {
        id: "admin",
        name: "Demo Administrator",
        email: "admin@example.test",
        password: "neighborly",
        address: "Community Center",
        activities: [],
        admin: true,
      },
    ],
    catalog: [
      item(
        "hall",
        "room",
        "Community Hall",
        "Event space for weddings, community meetings, and funerals.",
        80,
        "09:00",
        "20:00",
        "Community Center",
        "hour",
      ),
      item(
        "meeting",
        "room",
        "Meeting Room",
        "Space for meetings and small events.",
        20,
        "09:00",
        "20:00",
        "Community Center",
        "hour",
      ),
      item(
        "spanish",
        "class",
        "Spanish",
        "Volunteer-led introductory Spanish class.",
        20,
        "10:00",
        "11:00",
        "Meeting Room",
        "session",
        {
          dates: classDates(first, dayOffset(first, 21)),
          prerequisites: "None",
          language: "English / Spanish",
          level: "Beginner",
        },
      ),
      item(
        "crafts",
        "class",
        "Arts and crafts",
        "Volunteer-led arts and crafts class.",
        16,
        "13:00",
        "14:30",
        "Meeting Room",
        "session",
        {
          dates: [first, dayOffset(first, 7)],
          prerequisites: "None",
          language: "English",
          level: "All levels",
        },
      ),
      item(
        "painting",
        "class",
        "Painting",
        "Volunteer-led introductory painting class.",
        16,
        "15:00",
        "16:30",
        "Community Hall",
        "session",
        {
          dates: [first, dayOffset(first, 7)],
          prerequisites: "None",
          language: "English",
          level: "Beginner",
        },
      ),
      item(
        "shuttle-library",
        "shuttle",
        "Library shuttle",
        "Community Center → Public Library",
        12,
        "09:00",
        "09:20",
        "Community Center stop",
        "passenger",
      ),
      item(
        "shuttle-north",
        "shuttle",
        "Northside shuttle",
        "Northside stop → Community Center",
        12,
        "08:30",
        "08:50",
        "Northside stop",
        "passenger",
      ),
      item(
        "shuttle-return",
        "shuttle",
        "Return shuttle",
        "Community Center → Northside stop",
        12,
        "17:00",
        "17:20",
        "Community Center stop",
        "passenger",
      ),
      item(
        "ride",
        "ride",
        "On-demand ride",
        "Request a ride for your own date, time, pickup, and destination.",
        4,
        "08:00",
        "20:00",
        "Your pickup address",
        "request",
      ),
      item(
        "care-cleaning",
        "care",
        "Home cleaning",
        "Light cleaning at the recipient’s home.",
        1,
        "09:00",
        "17:00",
        "Your home",
        "appointment",
      ),
      item(
        "care-nursing",
        "care",
        "Nursing",
        "Request an available in-home nursing visit.",
        1,
        "09:00",
        "17:00",
        "Your home",
        "appointment",
      ),
      item(
        "care-welfare",
        "care",
        "Welfare check",
        "An in-home check-in for an elderly person or a person with a disability.",
        1,
        "09:00",
        "17:00",
        "Your home",
        "appointment",
      ),
    ],
    prices: {
      hall: 80,
      meeting: 40,
      spanish: 0,
      crafts: 10,
      painting: 15,
      "shuttle-library": 5,
      "shuttle-north": 5,
      "shuttle-return": 5,
      ride: 10,
      "care-cleaning": 20,
      "care-nursing": 0,
      "care-welfare": 0,
      catering: 8,
      cleaning: 20,
      table: 5,
      chair: 1,
    },
    offerings: [],
    bookings: [],
    donations: [],
  };
}
export function requireUser(s: AppState, id: string) {
  const u = s.users.find((u) => u.id === id);
  if (!u) throw Error("Sign in to an account to continue.");
  return u;
}
const minutes = (t: string) => {
  if (!/^\d{2}:\d{2}$/.test(t)) return NaN;
  const [h, m] = t.split(":").map(Number);
  return h < 24 && m < 60 ? h * 60 + m : NaN;
};
const nonnegative = (n: number) => Number.isFinite(n) && n >= 0;
const count = (n: number | undefined) =>
  n !== undefined && Number.isInteger(n) && n > 0;
export function isRoom(d: BookingDraft) {
  return d.kind === "room" || d.kind === "package-room";
}
export function isClass(d: BookingDraft) {
  return d.kind === "class" || d.kind === "package-class";
}
export function hasTrip(d: BookingDraft) {
  return (
    d.kind === "shuttle" ||
    d.kind === "package-room" ||
    d.kind === "package-class"
  );
}
export function remainingSeats(s: AppState, id: string, date: string) {
  const c = s.catalog.find((c) => c.id === id);
  if (!c) return 0;
  return (
    c.capacity -
    s.bookings.reduce(
      (sum, b) =>
        sum +
        (hasTrip(b.draft) &&
        (b.draft.tripId || b.draft.itemId) === id &&
        b.draft.date === date
          ? b.draft.passengers || 0
          : 0),
      0,
    )
  );
}
export function classSeats(s: AppState, id: string, date: string) {
  const c = s.catalog.find((c) => c.id === id);
  return (
    (c?.capacity || 0) -
    s.bookings.filter(
      (b) => isClass(b.draft) && b.draft.itemId === id && b.draft.date === date,
    ).length
  );
}
export function slotAvailable(
  s: AppState,
  id: string,
  date: string,
  start: string,
  end: string,
) {
  return !s.bookings.some(
    (b) =>
      b.draft.itemId === id &&
      b.draft.date === date &&
      (isRoom(b.draft) || b.draft.kind === "care") &&
      minutes(start) < minutes(b.draft.end || "") &&
      minutes(end) > minutes(b.draft.start || ""),
  );
}
export function quote(s: AppState, d: BookingDraft) {
  const c = s.catalog.find((c) => c.id === d.itemId);
  if (!c) throw Error("Service is unavailable.");
  const lines: PriceLine[] = [];
  const add = (label: string, amount: number) =>
    lines.push({ label, amount: Math.round(amount * 100) / 100 });
  if (isRoom(d)) {
    add(
      `${c.title} · ${(minutes(d.end || "") - minutes(d.start || "")) / 60} hours`,
      (s.prices[c.id] * (minutes(d.end || "") - minutes(d.start || ""))) / 60,
    );
    if (d.catering)
      add(`Catering · ${d.catering} people`, d.catering * s.prices.catering);
    if (d.cleaning) add("Room cleaning", s.prices.cleaning);
    if (d.tables) add(`Tables · ${d.tables}`, d.tables * s.prices.table);
    if (d.chairs) add(`Chairs · ${d.chairs}`, d.chairs * s.prices.chair);
  } else if (d.kind !== "shuttle") add(c.title, s.prices[c.id]);
  if (hasTrip(d) && (d.kind === "shuttle" || d.tripId)) {
    const id = d.kind === "shuttle" ? d.itemId : d.tripId!;
    const trip = s.catalog.find((c) => c.id === id && c.kind === "shuttle");
    add(
      `${trip?.title || "Shuttle"} · ${d.passengers || 1} passengers`,
      s.prices[id] * (d.passengers || 1),
    );
  }
  return {
    lines,
    total: Math.round(lines.reduce((a, b) => a + b.amount, 0) * 100) / 100,
  };
}
export function validateBooking(s: AppState, d: BookingDraft) {
  const c = s.catalog.find((c) => c.id === d.itemId);
  if (!c || !c.dates.includes(d.date) || d.date < today())
    throw Error("Choose an available date for this service.");
  const expectedKind = isRoom(d) ? "room" : isClass(d) ? "class" : d.kind;
  if (c.kind !== expectedKind) throw Error("Choose the correct service.");
  if (isRoom(d)) {
    if (!d.event?.trim() || !count(d.people) || d.people! > c.capacity)
      throw Error(`Enter an event and attendance between 1 and ${c.capacity}.`);
    for (const n of [d.catering || 0, d.tables || 0, d.chairs || 0])
      if (!Number.isInteger(n) || !nonnegative(n))
        throw Error("Add-on quantities must be nonnegative whole numbers.");
    if ((d.catering || 0) > d.people!)
      throw Error("Catering count cannot exceed event attendance.");
  }
  if (d.kind === "ride") {
    const pickup = minutes(d.start || "");
    if (
      !Number.isFinite(pickup) ||
      pickup < minutes(c.start) ||
      pickup > minutes(c.end)
    )
      throw Error(`Choose a pickup time between ${c.start} and ${c.end}.`);
  }
  if (isRoom(d) || d.kind === "care") {
    const a = minutes(d.start || ""),
      b = minutes(d.end || "");
    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      a >= b ||
      a < minutes(c.start) ||
      b > minutes(c.end)
    )
      throw Error(`Choose valid times between ${c.start} and ${c.end}.`);
    if (!slotAvailable(s, c.id, d.date, d.start!, d.end!))
      throw Error(
        "This time is already reserved. Choose another available time.",
      );
  }
  if (isClass(d) && classSeats(s, c.id, d.date) <= 0)
    throw Error("This class session is full.");
  if (
    d.kind === "care" &&
    (!d.recipient?.trim() || !d.address?.trim() || !d.notes?.trim())
  )
    throw Error("Enter recipient, home address, and assistance details.");
  if (
    d.kind === "ride" &&
    (!d.pickup?.trim() ||
      !d.destination?.trim() ||
      !count(d.passengers) ||
      d.passengers! > c.capacity)
  )
    throw Error("Enter pickup, destination, and 1–4 passengers.");
  if (hasTrip(d)) {
    const id = d.tripId || d.itemId,
      trip = s.catalog.find((c) => c.id === id && c.kind === "shuttle");
    if (!trip || !trip.dates.includes(d.date))
      throw Error("Choose a shuttle available on the reservation date.");
    if (!count(d.passengers))
      throw Error("Passenger count must be a positive whole number.");
    if (d.passengers! > remainingSeats(s, id, d.date))
      throw Error("Not enough shuttle seats available.");
  }
}
export function completeBooking(
  s: AppState,
  userId: string,
  d: BookingDraft,
  expectedTotal: number,
): AppState {
  requireUser(s, userId);
  validateBooking(s, d);
  const q = quote(s, d);
  if (
    !nonnegative(q.total) ||
    !Number.isFinite(expectedTotal) ||
    Math.abs(q.total - expectedTotal) > 0.001
  )
    throw Error("The price changed. Please review the latest total.");
  const booking: Booking = {
    id: crypto.randomUUID(),
    userId,
    draft: structuredClone(d),
    total: q.total,
    lines: q.lines,
    status: d.kind === "ride" ? "Request submitted" : "Confirmed",
  };
  return { ...s, bookings: [...s.bookings, booking] };
}
export function submitOffering(
  s: AppState,
  userId: string,
  input: OfferingInput,
): AppState {
  requireUser(s, userId);
  if (
    !input.title.trim() ||
    !input.description.trim() ||
    input.date < today() ||
    !Number.isFinite(minutes(input.start)) ||
    !Number.isFinite(minutes(input.end)) ||
    minutes(input.end) <= minutes(input.start)
  )
    throw Error("Complete the service details and valid availability.");
  if (input.kind !== "class" && !input.qualifications.trim())
    throw Error("Describe your qualifications.");
  if (input.kind === "class") {
    if (
      !input.language?.trim() ||
      !input.level?.trim() ||
      !input.prerequisites?.trim()
    )
      throw Error("Complete course language, level, and prerequisites.");
    classDates(input.date, input.recurring ? input.until : undefined);
    if (input.recurring && !input.until)
      throw Error("Choose a recurring end date.");
  }
  if (input.kind === "driver" && !input.modes?.length)
    throw Error("Choose shuttle, on-demand, or both.");
  if (input.kind === "care" && !input.services?.length)
    throw Error("Choose at least one home-care service.");
  return {
    ...s,
    offerings: [
      ...s.offerings,
      { ...input, id: crypto.randomUUID(), userId, status: "Submitted" },
    ],
  };
}
export function approveClass(
  s: AppState,
  userId: string,
  id: string,
  price: number,
): AppState {
  if (!requireUser(s, userId).admin)
    throw Error("Mock admin account required.");
  const o = s.offerings.find(
    (o) => o.id === id && o.kind === "class" && o.status === "Submitted",
  );
  if (!o) throw Error("This class is no longer awaiting approval.");
  if (!nonnegative(price)) throw Error("Enter a nonnegative sample price.");
  const course: CatalogItem = {
    id: o.id,
    kind: "class",
    title: o.title,
    description: o.description,
    capacity: 20,
    dates: classDates(o.date, o.recurring ? o.until : undefined),
    start: o.start,
    end: o.end,
    location: "Community Center",
    unit: "session",
    prerequisites: o.prerequisites,
    language: o.language,
    level: o.level,
  };
  return {
    ...s,
    catalog: [...s.catalog, course],
    prices: { ...s.prices, [id]: price },
    offerings: s.offerings.map((x) =>
      x.id === id ? { ...x, status: "Approved" } : x,
    ),
  };
}
export function donate(
  s: AppState,
  userId: string,
  amount: number,
  anonymous: boolean,
  donor: Donor,
): AppState {
  if (!Number.isFinite(amount) || amount <= 0)
    throw Error("Enter a positive donation amount.");
  const record: Donation = {
    id: crypto.randomUUID(),
    amount: Math.round(amount * 100) / 100,
    anonymous,
  };
  if (!anonymous) {
    requireUser(s, userId);
    if (!donor.name.trim() || !donor.email.trim() || !donor.address.trim())
      throw Error("Complete donor information for the sample receipt.");
    record.userId = userId;
    record.donor = { ...donor };
  }
  return { ...s, donations: [...s.donations, record] };
}
