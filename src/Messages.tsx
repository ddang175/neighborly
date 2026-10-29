import { useState } from "react";

import { Users, Send, LockKeyhole } from "lucide-react";
import { canPost, messageAllowed } from "./model";

import { useApp } from "./context";
import { Avatar, Empty, PageTitle, Field } from "./ui";

export function Messages() {
  const { s, u, mutate, open, notify } = useApp();
  const [active, setActive] = useState(""),
    [msg, setMsg] = useState(""),
    [to, setTo] = useState("");
  const chats = s.dm.filter(
    (d) =>
      canPost(u, u.neighborhood) &&
      canPost(
        s.users.find((v) => v.id === (d.from === u.id ? d.to : d.from))!,
        u.neighborhood,
      ) &&
      (d.from === u.id || d.to === u.id) &&
      !u.blocked.includes(d.from === u.id ? d.to : d.from),
  );
  const selected = chats.find((d) => d.id === active);
  const tasks = s.posts.filter((p) => messageAllowed(s, p.id, u.id));
  return (
    <>
      <PageTitle
        eyebrow="GOOD CONNECTIONS START WITH HELLO"
        title="A little conversation goes a long way."
        description="Plan a helping hand or get to know the neighbor around the corner."
      />
      <div className="message-layout">
        <section className="panel conversation-list">
          <h2>Your conversations</h2>
          {tasks.map((p) => (
            <button
              className="conversation"
              key={p.id}
              onClick={() => open(p.id)}
            >
              <span className="avatar">
                <Users size={19} />
              </span>
              <div>
                <strong>{p.title}</strong>
                <small>Task chat · {p.assigned.length + 1} participants</small>
              </div>
            </button>
          ))}
          {chats.map((d) => {
            const neighbor = s.users.find(
              (v) => v.id === (d.from === u.id ? d.to : d.from),
            )!;
            return (
              <button
                className={`conversation ${active === d.id ? "selected" : ""}`}
                key={d.id}
                onClick={() => setActive(d.id)}
              >
                <Avatar user={neighbor} />
                <div>
                  <strong>{neighbor.name}</strong>
                  <small>
                    {d.accepted
                      ? "Private conversation"
                      : d.to === u.id
                        ? "Message request"
                        : "Waiting for acceptance"}
                  </small>
                </div>
              </button>
            );
          })}
          <h3 className="spaced">Say hello</h3>
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!canPost(u, u.neighborhood)) {
                notify("Approved membership required");
                return;
              }
              if (chats.some((d) => d.from === to || d.to === to)) {
                notify("A request or conversation already exists");
                return;
              }
              mutate(
                (s) =>
                  s.dm.push({
                    id: crypto.randomUUID(),
                    from: u.id,
                    to,
                    accepted: false,
                    messages: [],
                  }),
                "Message request sent",
              );
              setTo("");
            }}
          >
            <Field label="Choose a neighbor">
              <select
                required
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                <option value="">Select neighbor</option>
                {s.users
                  .filter(
                    (v) =>
                      v.id !== u.id &&
                      canPost(v, u.neighborhood) &&
                      !v.blocked.includes(u.id),
                  )
                  .map((v) => (
                    <option value={v.id} key={v.id}>
                      {v.name}
                    </option>
                  ))}
              </select>
            </Field>
            <button className="secondary">Send message request</button>
          </form>
        </section>
        <section className="panel chat-space">
          {selected ? (
            <>
              <h2>
                {
                  s.users.find(
                    (v) =>
                      v.id ===
                      (selected.from === u.id ? selected.to : selected.from),
                  )!.name
                }
              </h2>
              {!selected.accepted ? (
                <div className="message-consent">
                  <LockKeyhole size={32} />
                  <h3>
                    {selected.to === u.id
                      ? "A neighbor would like to say hello."
                      : "Your request is on its way."}
                  </h3>
                  <p>Private messages begin after the recipient accepts.</p>
                  {selected.to === u.id && (
                    <div className="form-actions">
                      <button
                        className="primary"
                        onClick={() =>
                          mutate((s) => {
                            s.dm.find((d) => d.id === active)!.accepted = true;
                          }, "Conversation accepted")
                        }
                      >
                        Accept request
                      </button>
                      <button
                        className="secondary"
                        onClick={() => {
                          mutate((s) => {
                            s.dm = s.dm.filter((d) => d.id !== active);
                          }, "Request declined");
                          setActive("");
                        }}
                      >
                        Decline request
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="private-note">
                    <LockKeyhole size={14} /> A private conversation between
                    neighbors.
                  </p>
                  <div className="chat-messages">
                    {selected.messages.map((m, i) => (
                      <div
                        className={`message ${m.user === u.id ? "mine" : ""}`}
                        key={i}
                      >
                        <strong>
                          {s.users.find((u) => u.id === m.user)!.name}
                        </strong>
                        <p>{m.text}</p>
                      </div>
                    ))}
                  </div>
                  <form
                    className="inline-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (msg.trim())
                        mutate((s) =>
                          s.dm
                            .find((d) => d.id === active)!
                            .messages.push({ user: u.id, text: msg.trim() }),
                        );
                      setMsg("");
                    }}
                  >
                    <input
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      required
                      placeholder="Write a message…"
                      aria-label="Private message"
                    />
                    <button
                      className="primary"
                      aria-label="Send private message"
                    >
                      <Send size={17} />
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <Empty title="Make yourself a little more connected">
              Choose a conversation, accept a request, or say hello to someone
              new.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
