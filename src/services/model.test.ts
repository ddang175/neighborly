import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
beforeEach(() => vi.useFakeTimers({ now: new Date("2026-11-03T12:00:00Z") }));
afterEach(() => vi.useRealTimers());
import {
  createState,
  quote,
  completeBooking,
  submitOffering,
  approveClass,
  classDates,
  donate,
  type BookingDraft,
} from "./model";
const room: BookingDraft = {
  kind: "room",
  itemId: "hall",
  date: "2026-11-10",
  start: "10:00",
  end: "12:00",
  event: "Community meeting",
  people: 10,
  catering: 10,
  cleaning: true,
  tables: 2,
  chairs: 10,
};
describe("community service transactions", () => {
  it("itemizes hours and optional room extras from editable prices", () => {
    const s = createState("2026-11-10");
    expect(quote(s, room).total).toBe(280); // 160 + 80 + 20 + 10 + 10
    s.prices.table = 7;
    expect(quote(s, room).total).toBe(284);
  });
  it("keeps submitted classes private until approval and publishes course details", () => {
    const s = createState("2026-11-10");
    const next = submitOffering(s, "maya", {
      kind: "class",
      title: "Watercolors",
      date: "2026-11-10",
      start: "10:00",
      end: "11:00",
      description: "Explore color",
      prerequisites: "None",
      language: "English",
      level: "Beginner",
      qualifications: "Art teacher",
      recurring: true,
      until: "2026-11-24",
    });
    expect(next.catalog.some((c) => c.title === "Watercolors")).toBe(false);
    const approved = approveClass(next, "admin", next.offerings[0].id, 12);
    const course = approved.catalog.find((c) => c.title === "Watercolors")!;
    expect(course.description).toBe("Explore color");
    expect(course.dates).toEqual(["2026-11-10", "2026-11-17", "2026-11-24"]);
    expect(approved.prices[course.id]).toBe(12);
    expect(() => approveClass(next, "maya", next.offerings[0].id, 12)).toThrow(
      /admin/i,
    );
  });
  it("generates weekly occurrences without accepting reversed recurrence bounds", () => {
    expect(classDates("2026-11-10", "2026-11-24")).toEqual([
      "2026-11-10",
      "2026-11-17",
      "2026-11-24",
    ]);
    expect(() => classDates("2026-11-10", "2026-11-09")).toThrow();
  });
  it("rejects overlapping room reservations but permits adjacent slots", () => {
    const s = completeBooking(createState("2026-11-10"), "maya", room, 280);
    expect(() =>
      completeBooking(s, "maya", { ...room, start: "11:00" }, 200),
    ).toThrow(/available|reserved/i);
    expect(
      completeBooking(s, "maya", { ...room, start: "12:00", end: "13:00" }, 200)
        .bookings,
    ).toHaveLength(2);
  });
  it("does not partially reserve a room package when shuttle seats are unavailable", () => {
    const s = createState("2026-11-10");
    const d: BookingDraft = {
      ...room,
      kind: "package-room",
      tripId: "shuttle-library",
      passengers: 30,
    };
    expect(() => completeBooking(s, "maya", d, 430)).toThrow(/seat/i);
    expect(s.bookings).toHaveLength(0);
  });
  it("reserves shuttle seats and rejects fractional passenger counts", () => {
    const s = createState("2026-11-10");
    const d: BookingDraft = {
      kind: "shuttle",
      itemId: "shuttle-library",
      date: "2026-11-10",
      passengers: 2,
    };
    const next = completeBooking(s, "maya", d, 10);
    expect(next.bookings[0].total).toBe(10);
    expect(() =>
      completeBooking(next, "maya", { ...d, passengers: 11 }, 55),
    ).toThrow(/seat/i);
    expect(() =>
      completeBooking(s, "maya", { ...d, passengers: 1.5 }, 7.5),
    ).toThrow(/passenger/i);
  });
  it("rejects stale totals and unauthenticated transactions without state mutation", () => {
    const s = createState("2026-11-10");
    expect(() => completeBooking(s, "", room, 280)).toThrow(/account|sign/i);
    expect(() => completeBooking(s, "maya", room, 1)).toThrow(/price/i);
    expect(s.bookings).toHaveLength(0);
  });
  it("omits logged-in identity from anonymous donations and includes it for registered receipts", () => {
    const s = createState("2026-11-10");
    const anonymous = donate(s, "maya", 25, true, {
      name: "Maya Chen",
      email: "maya@example.test",
      address: "123 Main St",
    });
    expect(anonymous.donations[0]).not.toHaveProperty("userId");
    expect(anonymous.donations[0]).not.toHaveProperty("donor");
    expect(
      donate(s, "maya", 25, false, {
        name: "Maya Chen",
        email: "maya@example.test",
        address: "123 Main St",
      }).donations[0].userId,
    ).toBe("maya");
    expect(() =>
      donate(s, "", 25, false, { name: "", email: "", address: "" }),
    ).toThrow();
  });
});

describe("availability and malformed input boundaries", () => {
  it("books both parts of a valid class package at their combined price", () => {
    const s = createState("2026-11-10");
    const d: BookingDraft = {
      kind: "package-class",
      itemId: "painting",
      date: "2026-11-10",
      tripId: "shuttle-north",
      passengers: 2,
    };
    const next = completeBooking(s, "maya", d, 25);
    expect(next.bookings).toHaveLength(1);
    expect(next.bookings[0].lines.map((l) => l.amount)).toEqual([15, 10]);
  });
  it("rejects invalid provider end times rather than accepting malformed availability", () => {
    expect(() =>
      submitOffering(createState("2026-11-10"), "maya", {
        kind: "driver",
        title: "Driving",
        date: "2026-11-10",
        start: "10:00",
        end: "invalid",
        description: "Available",
        qualifications: "Licensed driver",
        modes: ["Scheduled shuttle"],
      }),
    ).toThrow();
  });
  it("rejects care overlaps and out-of-hours room reservations", () => {
    const s = createState("2026-11-10");
    const d: BookingDraft = {
      kind: "care",
      itemId: "care-cleaning",
      date: "2026-11-10",
      start: "09:00",
      end: "10:00",
      recipient: "Sample recipient",
      address: "Sample address",
      notes: "Light cleaning",
    };
    const next = completeBooking(s, "maya", d, 20);
    expect(() => completeBooking(next, "maya", d, 20)).toThrow(/reserved/i);
    expect(() =>
      completeBooking(s, "maya", { ...room, start: "07:00" }, 440),
    ).toThrow(/valid times/i);
  });
  it("rejects fractional add-ons and catering beyond attendance", () => {
    const s = createState("2026-11-10");
    expect(() =>
      completeBooking(s, "maya", { ...room, tables: 1.5 }, 277.5),
    ).toThrow(/whole numbers/i);
    expect(() =>
      completeBooking(s, "maya", { ...room, catering: 11 }, 288),
    ).toThrow(/attendance/i);
  });
});

describe("review findings", () => {
  it("does not charge a package for a shuttle before a trip is selected", () => {
    const s = createState("2026-11-10");
    expect(quote(s, { ...room, kind: "package-room" }).total).toBe(280);
    const draft: BookingDraft = {
      kind: "package-class",
      itemId: "painting",
      date: "2026-11-10",
      passengers: 1,
    };
    expect(quote(s, draft).lines).toHaveLength(1);
    expect(quote(s, draft).total).toBe(15);
    expect(quote(s, { ...draft, tripId: "shuttle-library" }).total).toBe(20);
  });
  it("validates requested pickup time directly without requiring a hidden arrival time", () => {
    const s = createState("2026-11-10");
    const draft: BookingDraft = {
      kind: "ride",
      itemId: "ride",
      date: "2026-11-10",
      start: "19:30",
      pickup: "Sample home",
      destination: "Community Center",
      passengers: 1,
    };
    expect(completeBooking(s, "maya", draft, 10).bookings[0].status).toBe(
      "Request submitted",
    );
    expect(() =>
      completeBooking(s, "maya", { ...draft, start: "20:30" }, 10),
    ).toThrow(/pickup|time/i);
  });
});
