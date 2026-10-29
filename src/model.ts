export const categories = [
  "Yard & garden",
  "Home & repairs",
  "Errands",
  "Tech help",
  "Community",
];
export const kinds = [
  "Help request",
  "Offer help",
  "PSA",
  "Giveaway",
  "Garage sale",
  "Event",
];
export const statuses = [
  "Open",
  "Assigned",
  "In progress",
  "Awaiting confirmation",
  "Completed",
  "Cancelled",
] as const;
export type Status = (typeof statuses)[number];
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  neighborhood: string;
  membership: string;
  role: string;
  address: string;
  bio: string;
  available: boolean;
  points: number;
  completed: number;
  categoryCounts: Record<string, number>;
  groups: string[];
  muted: string[];
  categories: string[];
  channels: { website: boolean; email: boolean; browser: boolean };
  blocked: string[];
}
export interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  kind: string;
  location: string;
  neighborhood: string;
  group: string;
  share: boolean;
  author: string;
  status: Status;
  count: number;
  date: string;
  photo: string;
  applications: string[];
  assigned: string[];
  votes: Record<string, number>;
  reactions: string[];
  comments: { user: string; text: string }[];
  messages: { user: string; text: string }[];
  history: string[];
  awarded: boolean;
  confirmationAt?: number;
  exactAddress?: string;
}
export interface State {
  users: User[];
  posts: Post[];
  alerts: {
    id: string;
    user: string;
    text: string;
    post: string;
    read: boolean;
    channels: string[];
  }[];
  groups: {
    name: string;
    description: string;
    icon: string;
    approved: boolean;
    neighborhood: string;
  }[];
  reports: {
    id: string;
    post: string;
    reporter: string;
    reason: string;
    status: string;
    decision: string;
    escalated: boolean;
  }[];
  proposals: {
    id: string;
    name: string;
    type: string;
    status: string;
    user: string;
    neighborhood?: string;
    description?: string;
  }[];
  dm: {
    id: string;
    from: string;
    to: string;
    accepted: boolean;
    messages: { user: string; text: string }[];
  }[];
}
const user = (id: string, name: string, extra: Partial<User> = {}): User => ({
  id,
  name,
  email: `${id}@example.test`,
  password: "neighborly",
  neighborhood: "Old Town",
  membership: "Approved",
  role: "Neighbor",
  address: "142 Fictional Lane",
  bio: "Making our little corner of Ames a little kinder.",
  available: true,
  points: 64,
  completed: 2,
  categoryCounts: {},
  groups: ["Garden Club"],
  muted: [],
  categories: [...categories],
  channels: { website: true, email: true, browser: false },
  blocked: [],
  ...extra,
});
const post = (id: string, title: string, extra: Partial<Post> = {}): Post => ({
  id,
  title,
  description:
    "A small act of kindness can make a big difference. Thanks for being part of our neighborhood!",
  category: "Yard & garden",
  kind: "Help request",
  location: "Near Brookside Park",
  neighborhood: "Old Town",
  group: "",
  share: true,
  author: "maya",
  status: "Open",
  count: 2,
  date: "2026-10-31T10:00",
  photo: "",
  applications: [],
  assigned: [],
  votes: {},
  reactions: [],
  comments: [],
  messages: [],
  history: ["Request opened"],
  awarded: false,
  ...extra,
});
export function seed(): State {
  return {
    users: [
      user("maya", "Maya Chen", { points: 86, completed: 6 }),
      user("eli", "Eli Brooks", { points: 128, completed: 4 }),
      user("june", "June Park", { points: 215, completed: 12 }),
      user("pending", "Sam Rivera", { membership: "Pending" }),
      user("mod", "Robin Ellis", {
        role: "Moderator",
        points: 320,
        completed: 18,
      }),
      user("staff", "Taylor Reed", { role: "Staff" }),
    ],
    posts: [
      post("leaves", "A little help with autumn leaves", {
        description:
          "The big maple has been busy! I could use a couple of extra hands to rake the front yard this Saturday. I have bags, rakes, and warm apple cider. 🍂",
        comments: [
          {
            user: "june",
            text: "Love this. What a lovely way to spend a fall morning!",
          },
        ],
        votes: { june: 1, mod: 1, staff: 1 },
      }),
      post("books", "A few good books, free to a new home", {
        kind: "Giveaway",
        category: "Community",
        author: "june",
        description:
          "Making room on the bookshelf. A lovely mix of novels, cookbooks, and a few children’s favorites. Take one or take a stack!",
        location: "Near the public library",
        photo: "books",
        votes: { eli: 1, maya: 1 },
      }),
      post("tech", "A friendly hand with your tech", {
        kind: "Offer help",
        category: "Tech help",
        author: "eli",
        description:
          "New phone? Stubborn laptop? I’m happy to help neighbors with everyday tech, free of charge. Available most Sunday afternoons.",
        location: "Old Town",
        count: 1,
      }),
      post("garden", "Let’s grow something together", {
        kind: "Event",
        category: "Community",
        author: "june",
        group: "Garden Club",
        description:
          "Join our fall seed swap and share ideas for next spring. Everyone is welcome, green thumb or otherwise.",
        location: "Community garden",
        photo: "garden",
      }),
      post("psa", "A heads-up from the neighborhood", {
        kind: "PSA",
        category: "Community",
        author: "mod",
        description:
          "The east trail entrance at Brookside Park will be closed for maintenance on Tuesday. The west entrance remains open.",
        location: "Brookside Park",
      }),
      post("sale", "Saturday porch treasure hunt", {
        kind: "Garage sale",
        category: "Community",
        author: "june",
        description:
          "Stop by our neighborhood garage sale. Books, planters, and household treasures. A chance to meet your neighbors.",
        location: "Near the library",
      }),
    ],
    alerts: [
      {
        id: "welcome",
        user: "maya",
        text: "Welcome to Old Town. A little kindness starts here.",
        post: "",
        read: false,
        channels: ["website"],
      },
    ],
    groups: [
      {
        name: "Garden Club",
        description:
          "Growing plants, sharing seeds, and getting our hands a little dirty.",
        icon: "🌱",
        approved: true,
        neighborhood: "Old Town",
      },
      {
        name: "Book Exchange",
        description:
          "Good stories deserve a second home. Meet your next favorite read.",
        icon: "📚",
        approved: true,
        neighborhood: "Old Town",
      },
      {
        name: "Old Town Together",
        description:
          "Small projects and good company. Let’s make things happen.",
        icon: "☀️",
        approved: true,
        neighborhood: "Old Town",
      },
    ],
    reports: [
      {
        id: "r1",
        post: "psa",
        reporter: "eli",
        reason: "Please check the park closure dates.",
        status: "Open",
        decision: "",
        escalated: false,
      },
    ],
    proposals: [],
    dm: [
      { id: "hello", from: "june", to: "maya", accepted: false, messages: [] },
    ],
  };
}
export const canPost = (u: User, n: string) =>
  u.membership === "Approved" && u.neighborhood === n;
export function publicPost(p: Post) {
  const { exactAddress: _, ...safe } = p;
  return safe;
}
function get(s: State, id: string) {
  const p = s.posts.find((p) => p.id === id);
  if (!p) throw Error("Post unavailable");
  return p;
}
function member(s: State, id: string, p: Post) {
  const u = s.users.find((u) => u.id === id);
  if (!u || !canPost(u, p.neighborhood))
    throw Error("Approved neighborhood membership required");
  return u;
}
export function vote(s: State, id: string, uid: string, value: number) {
  const p = get(s, id);
  member(s, uid, p);
  const old = p.votes[uid] || 0;
  const next = old === value ? 0 : value;
  p.votes[uid] = next;
  s.users.find((u) => u.id === p.author)!.points += next - old;
}
export function eligible(
  u: User,
  p: Post,
  channel: "website" | "email" | "browser" = "website",
) {
  return (
    canPost(u, p.neighborhood) &&
    u.id !== p.author &&
    u.available &&
    u.categories.includes(p.category) &&
    (!p.group || (u.groups.includes(p.group) && !u.muted.includes(p.group))) &&
    u.channels[channel]
  );
}
export const hasExactAddress = (text: string) =>
  /\b\d{1,6}\s+(?:[\w.'-]+\s+){1,5}(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|court|ct|boulevard|blvd|way|place|pl|circle|cir)\b/i.test(
    text,
  );
export function createPost(s: State, uid: string, input: Partial<Post>) {
  const u = s.users.find((u) => u.id === uid)!;
  if (!u || !canPost(u, input.neighborhood || u.neighborhood))
    throw Error("Approved neighborhood membership required");
  if (
    !input.title?.trim() ||
    !input.description?.trim() ||
    !input.category ||
    !input.location?.trim()
  )
    throw Error(
      "Title, description, category, and approximate location are required",
    );
  if (
    hasExactAddress([input.location, input.title, input.description].join(" "))
  )
    throw Error(
      "Keep exact addresses private. Use a landmark or general area.",
    );
  if (input.group && !u.groups.includes(input.group))
    throw Error("Join the group before posting");
  const p = post(crypto.randomUUID(), input.title, {
    ...input,
    author: uid,
    neighborhood: u.neighborhood,
    applications: [],
    assigned: [],
    votes: {},
    comments: [],
    messages: [],
    history: ["Request opened"],
    awarded: false,
    status: "Open",
  });
  s.posts.unshift(p);
  if (p.kind === "Help request")
    for (const v of s.users) {
      const channels = (["website", "email", "browser"] as const).filter((c) =>
        eligible(v, p, c),
      );
      if (channels.length)
        s.alerts.unshift({
          id: crypto.randomUUID(),
          user: v.id,
          text: p.title,
          post: p.id,
          read: false,
          channels: [...channels],
        });
    }
  return p;
}
export function apply(s: State, id: string, uid: string) {
  const p = get(s, id),
    u = member(s, uid, p);
  if (
    !u.available ||
    p.author === uid ||
    !["Open", "Assigned"].includes(p.status) ||
    (p.group && !u.groups.includes(p.group))
  )
    throw Error("This request is not available to you");
  if (p.applications.includes(uid))
    p.applications = p.applications.filter((i) => i !== uid);
  else p.applications.push(uid);
}
export function approve(s: State, id: string, actor: string, uid: string) {
  const p = get(s, id);
  member(s, actor, p);
  if (
    p.author !== actor ||
    !p.applications.includes(uid) ||
    p.assigned.length >= p.count ||
    !["Open", "Assigned"].includes(p.status)
  )
    throw Error("Only requester can approve eligible applications");
  if (!p.assigned.includes(uid)) {
    p.assigned.push(uid);
    p.history.push(`Approved ${uid}`);
  }
  p.applications = p.applications.filter((i) => i !== uid);
  p.status = "Assigned";
  s.alerts.unshift({
    id: crypto.randomUUID(),
    user: uid,
    text: `You were approved: ${p.title}`,
    post: id,
    read: false,
    channels: ["website"],
  });
}
export function messageAllowed(s: State, id: string, uid: string) {
  const p = get(s, id);
  return (
    canPost(
      s.users.find((u) => u.id === uid)!,
      p.neighborhood,
    ) &&
    p.assigned.length > 0 &&
    (p.author === uid || p.assigned.includes(uid))
  );
}
function reward(s: State, p: Post) {
  if (p.awarded) return;
  p.awarded = true;
  for (const id of p.assigned) {
    const u = s.users.find((u) => u.id === id)!;
    u.points += 10;
    u.completed++;
    u.categoryCounts[p.category] = (u.categoryCounts[p.category] || 0) + 1;
  }
}
export function transition(s: State, id: string, actor: string, next: Status) {
  const p = get(s, id),
    u = member(s, actor, p);
  const owner = p.author === actor,
    participant = p.assigned.includes(actor);
  if (next === p.status && next === "Completed") return;
  const valid =
    (next === "In progress" &&
      p.status === "Assigned" &&
      (owner || participant)) ||
    (next === "Awaiting confirmation" &&
      p.status === "In progress" &&
      (owner || participant)) ||
    (next === "Completed" && p.status === "Awaiting confirmation" && owner) ||
    (next === "Cancelled" &&
      ["Open", "Assigned", "In progress", "Awaiting confirmation"].includes(
        p.status,
      ) &&
      (owner || participant)) ||
    (next === "Open" && p.status === "Cancelled" && owner);
  if (!valid) throw Error("Task transition is not permitted");
  p.status = next;
  p.history.push(`${next} by ${u.name.split(" ")[0]}`);
  if (next === "Open") {
    p.assigned = [];
    p.applications = [];
  }
  if (next === "Awaiting confirmation") p.confirmationAt = Date.now();
  if (next === "Completed") reward(s, p);
}
export function fallbackClose(
  s: State,
  id: string,
  actor: string,
  hours: number,
) {
  const p = get(s, id);
  member(s, actor, p);
  if (
    p.status !== "Awaiting confirmation" ||
    !p.assigned.includes(actor) ||
    hours < 72
  )
    throw Error("Wait 72 hours for requester confirmation");
  p.status = "Completed";
  p.history.push("Closed after 72 hours; moderator review available");
  reward(s, p);
  s.reports.push({
    id: crypto.randomUUID(),
    post: id,
    reporter: actor,
    reason: "72-hour fallback closure review",
    status: "Open",
    decision: "",
    escalated: false,
  });
}
export function badges(u: User) {
  return [
    ...[50, 100, 250].filter((n) => u.points >= n).map((n) => `${n} points`),
    ...[1, 5, 10]
      .filter((n) => u.completed >= n)
      .map((n) => (n === 1 ? "First helping hand" : `${n} tasks`)),
    ...Object.entries(u.categoryCounts)
      .filter(([, v]) => v >= 5)
      .map(([k]) => `${k} champion`),
  ];
}

export function addComment(s: State, id: string, uid: string, text: string) {
  const p = get(s, id);
  member(s, uid, p);
  if (hasExactAddress(text))
    throw Error("Keep exact addresses private. Use private chat.");
  if (text.trim()) p.comments.push({ user: uid, text: text.trim() });
}

export function editPost(
  s: State,
  id: string,
  actor: string,
  input: Partial<Post>,
) {
  const p = get(s, id),
    u = member(s, actor, p);
  if (p.author !== actor) throw Error("Only the author can edit");
  if (
    !input.title?.trim() ||
    !input.description?.trim() ||
    !input.category ||
    !input.location?.trim()
  )
    throw Error(
      "Title, description, category, and approximate location are required",
    );
  if (hasExactAddress(`${input.title} ${input.description} ${input.location}`))
    throw Error("Keep exact addresses private.");
  const count = input.count ?? p.count;
  if (
    !Number.isInteger(count) ||
    count < 1 ||
    count > 20 ||
    count < p.assigned.length
  )
    throw Error(
      "Volunteer capacity must be at least the approved participant count, from 1 to 20.",
    );
  if (input.group && !u.groups.includes(input.group))
    throw Error("Join the group before posting");
  Object.assign(p, {
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    location: input.location.trim(),
    date: input.date ?? p.date,
    count,
    group: input.group ?? p.group,
    share: input.share ?? p.share,
    photo: input.photo ?? p.photo,
  });
}
