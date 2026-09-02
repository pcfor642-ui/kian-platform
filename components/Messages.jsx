"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { T, FONT } from "./theme";
import { fieldInput, iconBtn, primaryIconBtn, SectionTitle, EmptyNote } from "./ui";
import { useMessages } from "./api-hooks";

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
}

function ChatView({ me, other, messages, onSend, onBack }) {
  const [text, setText] = useState("");
  const thread = messages
    .filter((m) => (m.senderId === me.id && m.receiverId === other.id) || (m.senderId === other.id && m.receiverId === me.id))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const submit = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
        {onBack && (
          <button onClick={onBack} style={iconBtn}>
            <ArrowRight size={19} />
          </button>
        )}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: T.purpleSoft,
            color: T.purple,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {other.name.trim()[0]}
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{other.name}</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "14px 2px", display: "flex", flexDirection: "column", gap: 8 }}>
        {thread.length === 0 && <EmptyNote text="پیامی وجود ندارد." />}
        {thread.map((m) => {
          const mine = m.senderId === me.id;
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-start" : "flex-end" }}>
              <div
                style={{
                  maxWidth: "76%",
                  background: mine ? `linear-gradient(135deg, ${T.blue}, ${T.purple})` : T.surface,
                  color: mine ? "#fff" : T.text,
                  border: mine ? "none" : `1px solid ${T.border}`,
                  borderRadius: mine ? "16px 16px 16px 4px" : "16px 16px 4px 16px",
                  padding: "10px 13px",
                  fontSize: 13.5,
                  wordBreak: "keep-all",
                  overflowWrap: "break-word",
                }}
              >
                {m.text}
                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: "left" }}>{formatTime(m.createdAt)}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${T.border}` }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="پیام خود را بنویسید..."
          style={{ ...fieldInput, flex: 1 }}
        />
        <button onClick={submit} style={primaryIconBtn}>
          <ArrowRight size={17} style={{ transform: "scaleX(-1)" }} />
        </button>
      </div>
    </div>
  );
}

function ContactListItem({ contact, roleLabel, last, unread, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "13px 14px",
        marginBottom: 8,
        cursor: "pointer",
        textAlign: "right",
        fontFamily: FONT,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: roleLabel === "معلم" ? T.blueSoft : T.purpleSoft,
            color: roleLabel === "معلم" ? T.blue : T.purple,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          {contact.name.trim()[0]}
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13.5, color: T.text, wordBreak: "keep-all" }}>{contact.name}</span>
            {roleLabel && (
              <span style={{ fontSize: 10.5, color: T.textFaint, background: T.bg, padding: "2px 7px", borderRadius: 999 }}>
                {roleLabel}
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: T.textFaint, marginTop: 2, wordBreak: "keep-all", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {last ? last.text : "هنوز گفت‌وگویی نیست"}
          </div>
        </div>
      </div>
      {unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.blue }} />}
    </button>
  );
}

export function AdminMessages({ user, teachers, students }) {
  const { ready, messages, send, markRead } = useMessages();
  const [activeId, setActiveId] = useState(null);

  if (!ready) return <EmptyNote text="در حال بارگذاری پیام‌ها..." />;

  const contacts = [
    ...teachers.map((t) => ({ ...t, roleLabel: "معلم" })),
    ...students.map((s) => ({ ...s, roleLabel: "دانش‌آموز" })),
  ];

  const other = contacts.find((c) => c.id === activeId);

  if (other) {
    return (
      <div style={{ paddingTop: 8 }}>
        <ChatView me={user} other={other} messages={messages} onSend={(text) => send(other.id, text)} onBack={() => setActiveId(null)} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>پیام‌ها</SectionTitle>
      {contacts.length === 0 && <EmptyNote text="کسی برای گفت‌وگو وجود ندارد." />}
      {contacts.map((c) => {
        const thread = messages
          .filter((m) => (m.senderId === user.id && m.receiverId === c.id) || (m.senderId === c.id && m.receiverId === user.id))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const last = thread[0];
        const unread = thread.some((m) => m.receiverId === user.id && !m.isRead);
        return (
          <ContactListItem
            key={c.id}
            contact={c}
            roleLabel={c.roleLabel}
            last={last}
            unread={unread}
            onClick={() => {
              setActiveId(c.id);
              markRead(c.id);
            }}
          />
        );
      })}
    </div>
  );
}

export function TeacherMessages({ user, students }) {
  const { ready, messages, send, markRead } = useMessages();
  const [activeId, setActiveId] = useState(null);

  if (!ready) return <EmptyNote text="در حال بارگذاری پیام‌ها..." />;

  const other = students.find((s) => s.id === activeId);

  if (other) {
    return (
      <div style={{ paddingTop: 8 }}>
        <ChatView me={user} other={other} messages={messages} onSend={(text) => send(other.id, text)} onBack={() => setActiveId(null)} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 8 }}>
      <SectionTitle>پیام‌ها</SectionTitle>
      {students.length === 0 && <EmptyNote text="دانش‌آموزی برای گفت‌وگو وجود ندارد." />}
      {students.map((s) => {
        const thread = messages
          .filter((m) => (m.senderId === user.id && m.receiverId === s.id) || (m.senderId === s.id && m.receiverId === user.id))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const last = thread[0];
        const unread = thread.some((m) => m.receiverId === user.id && !m.isRead);
        return (
          <ContactListItem
            key={s.id}
            contact={s}
            last={last}
            unread={unread}
            onClick={() => {
              setActiveId(s.id);
              markRead(s.id);
            }}
          />
        );
      })}
    </div>
  );
}

export function ChatViewWithRead({ user, teacher, messages, sendMessage, markRead }) {
  useEffect(() => {
    markRead(teacher.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <SectionTitle>پیام‌ها</SectionTitle>
      <ChatView me={user} other={teacher} messages={messages} onSend={(text) => sendMessage(teacher.id, text)} />
    </>
  );
}
