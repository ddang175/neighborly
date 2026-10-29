import { describe, it, expect } from "vitest";
import {
  seed,
  canPost,
  publicPost,
  vote,
  createPost,
  apply,
  approve,
  transition,
  eligible,
  badges,
  messageAllowed,
  fallbackClose,
  addComment,
  editPost,
} from "./model";
describe("scope rules", () => {
  it("allows numbers in public descriptions but rejects full street addresses in comments", () => {
    const s = seed();
    expect(() =>
      createPost(s, "maya", {
        title: "Need 2 volunteers",
        description: "Please bring 2 rakes",
        category: "Yard & garden",
        location: "Near the park",
      }),
    ).not.toThrow();
    expect(() =>
      addComment(s, s.posts[0].id, "eli", "Meet at 123 Main Street"),
    ).toThrow("Keep exact addresses private");
    addComment(s, s.posts[0].id, "eli", "I can bring 2 rakes");
    expect(s.posts[0].comments.at(-1)?.text).toBe("I can bring 2 rakes");
  });

  it("only approved neighbors publish in their own neighborhood", () => {
    const s = seed();
    expect(canPost(s.users[0], "Old Town")).toBe(true);
    expect(canPost(s.users[3], "Old Town")).toBe(false);
    expect(canPost(s.users[0], "Somerset")).toBe(false);
  });
  it("public posts omit private exact addresses", () => {
    expect(
      JSON.stringify(
        publicPost({
          ...seed().posts[0],
          exactAddress: "123 Fictional Street",
        }),
      ),
    ).not.toContain("123 Fictional Street");
  });
  it("one current vote updates author score with reversible deltas", () => {
    const s = seed(),
      p = s.posts[0],
      a = s.users.find((u) => u.id === p.author)!;
    const n = a.points;
    vote(s, p.id, "eli", 1);
    expect(a.points).toBe(n + 1);
    vote(s, p.id, "eli", -1);
    expect(a.points).toBe(n - 1);
    vote(s, p.id, "eli", -1);
    expect(a.points).toBe(n);
  });
  it("filters alerts by availability, category, group membership and mute/channel preferences", () => {
    const s = seed(),
      u = s.users[1],
      p = { ...s.posts[0], group: "Garden Club" };
    expect(eligible(u, p)).toBe(true);
    u.muted = ["Garden Club"];
    expect(eligible(u, p)).toBe(false);
    u.muted = [];
    u.categories = [];
    expect(eligible(u, p)).toBe(false);
    u.categories = ["Yard & garden"];
    u.available = false;
    expect(eligible(u, p)).toBe(false);
    u.available = true;
    u.channels.website = false;
    expect(eligible(u, p)).toBe(false);
  });
  it("request creates only eligible simulated alerts and rejects exact public addresses", () => {
    const s = seed();
    const p = createPost(s, "maya", {
      title: "Leaves",
      description: "Help rake",
      category: "Yard & garden",
      location: "Near the park",
      kind: "Help request",
      group: "Garden Club",
    });
    expect(s.alerts.some((a) => a.user === "eli" && a.post === p.id)).toBe(
      true,
    );
    expect(() => createPost(s, "pending", { ...p, title: "No" })).toThrow();
    expect(() =>
      createPost(s, "maya", { ...p, location: "123 Main Street" }),
    ).toThrow();
  });
  it("applications need requester approval and multiple participants get private task chat", () => {
    const s = seed(),
      id = s.posts[0].id;
    apply(s, id, "eli");
    expect(s.posts[0].status).toBe("Open");
    expect(messageAllowed(s, id, "eli")).toBe(false);
    expect(() => approve(s, id, "eli", "eli")).toThrow();
    approve(s, id, "maya", "eli");
    apply(s, id, "june");
    approve(s, id, "maya", "june");
    expect(s.posts[0].assigned).toEqual(["eli", "june"]);
    expect(messageAllowed(s, id, "eli")).toBe(true);
    expect(messageAllowed(s, id, "pending")).toBe(false);
  });
  it("completion requires requester confirmation and awards each participant exactly once", () => {
    const s = seed(),
      id = s.posts[0].id,
      n = s.users[1].points;
    apply(s, id, "eli");
    approve(s, id, "maya", "eli");
    expect(() => transition(s, id, "eli", "Completed")).toThrow();
    transition(s, id, "eli", "In progress");
    transition(s, id, "eli", "Awaiting confirmation");
    expect(() => transition(s, id, "eli", "Completed")).toThrow();
    transition(s, id, "maya", "Completed");
    transition(s, id, "maya", "Completed");
    expect(s.users[1].points).toBe(n + 10);
    expect(s.users[1].completed).toBe(5);
  });
  it("cancellation and reopening preserve assignment history and do not award points", () => {
    const s = seed(),
      id = s.posts[0].id;
    apply(s, id, "eli");
    approve(s, id, "maya", "eli");
    transition(s, id, "maya", "Cancelled");
    transition(s, id, "maya", "Open");
    expect(s.posts[0].assigned).toEqual([]);
    expect(s.posts[0].history.join(" ")).toContain("Cancelled");
    expect(s.posts[0].history.join(" ")).toContain("eli");
  });
  it("fallback closure is available only after 72 hours and is reviewable", () => {
    const s = seed(),
      id = s.posts[0].id;
    apply(s, id, "eli");
    approve(s, id, "maya", "eli");
    transition(s, id, "eli", "In progress");
    transition(s, id, "eli", "Awaiting confirmation");
    expect(() => fallbackClose(s, id, "eli", 71)).toThrow();
    fallbackClose(s, id, "eli", 72);
    expect(s.posts[0].status).toBe("Completed");
    expect(s.reports.some((r) => r.post === id)).toBe(true);
  });
  it("badges use stated point, task, and service-category thresholds", () => {
    expect(
      badges({
        ...seed().users[0],
        points: 100,
        completed: 5,
        categoryCounts: { "Yard & garden": 5 },
      }),
    ).toEqual(
      expect.arrayContaining([
        "50 points",
        "100 points",
        "First helping hand",
        "5 tasks",
        "Yard & garden champion",
      ]),
    );
  });
});

describe("editing requests", () => {
  it("persists every editable field and sharing choice", () => {
    const s = seed(),
      id = s.posts[0].id;
    editPost(s, id, "maya", {
      ...s.posts[0],
      date: "2026-11-05T13:00",
      count: 3,
      group: "Garden Club",
      share: false,
    });
    expect(s.posts[0]).toMatchObject({
      date: "2026-11-05T13:00",
      count: 3,
      group: "Garden Club",
      share: false,
    });
  });
  it("cannot reduce capacity below existing approved participants", () => {
    const s = seed(),
      id = s.posts[0].id;
    apply(s, id, "eli");
    approve(s, id, "maya", "eli");
    apply(s, id, "june");
    approve(s, id, "maya", "june");
    expect(() =>
      editPost(s, id, "maya", { ...s.posts[0], count: 1 }),
    ).toThrow();
  });
});
