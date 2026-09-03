"use client";

import { Menu, X, Bell, Sun, Moon, Check } from "lucide-react";
import { T, FONT } from "./theme";

// These are exported as plain-looking objects but every theme-dependent
// value is a getter, so toggling dark mode (which mutates T in place)
// is reflected the next time React reads style.xxx during render — a
// literal `color: T.text` here would freeze at first import instead.
export const fieldLabel = {
  display: "block",
  fontSize: 13,
  marginBottom: 6,
  fontFamily: FONT,
  get color() { return T.textSoft; },
};

export const fieldInput = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  fontFamily: FONT,
  fontSize: 14,
  outline: "none",
  get border() { return `1px solid ${T.border}`; },
  get background() { return T.surface; },
  get color() { return T.text; },
};

export const iconBtn = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  padding: 6,
  display: "flex",
  get color() { return T.textSoft; },
};

export const primaryIconBtn = {
  width: 40,
  height: 40,
  borderRadius: 12,
  border: "none",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  get background() { return `linear-gradient(135deg, ${T.blue}, ${T.purple})`; },
};

export const ghostSmallBtn = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  fontSize: 12,
  borderRadius: 10,
  padding: "7px 12px",
  fontFamily: FONT,
  cursor: "pointer",
  get border() { return `1px solid ${T.border}`; },
  get background() { return T.surface; },
  get color() { return T.textSoft; },
};

export const primarySmallBtn = {
  fontSize: 12.5,
  border: "none",
  color: "#fff",
  borderRadius: 10,
  padding: "9px 14px",
  fontFamily: FONT,
  fontWeight: 700,
  cursor: "pointer",
  get background() { return T.blue; },
};

export const aiButton = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  width: "100%",
  justifyContent: "center",
  borderRadius: 12,
  padding: "11px 0",
  fontFamily: FONT,
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  marginBottom: 16,
  get border() { return `1px solid ${T.purple}`; },
  get background() { return T.purpleSoft; },
  get color() { return T.purple; },
};

export const logoutBtn = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  width: "100%",
  justifyContent: "center",
  padding: "12px 0",
  borderRadius: 14,
  fontFamily: FONT,
  get border() { return `1px solid ${T.dangerSoft}`; },
  get background() { return T.dangerSoft; },
  get color() { return T.danger; },
  fontSize: 13.5,
  cursor: "pointer",
};

export function GlassPanel({ children, style }) {
  return (
    <div
      style={{
        background: T.glass,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${T.glassBorder}`,
        borderRadius: 20,
        boxShadow: "0 12px 30px -18px rgba(20,30,60,0.35)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function StatRow({ items }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: "14px 14px",
          }}
        >
          <div style={{ color: it.color || T.blue, marginBottom: 8 }}>{it.icon}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{it.value}</div>
          <div style={{ fontSize: 12, color: T.textSoft, marginTop: 2, wordBreak: "keep-all" }}>{it.label}</div>
        </div>
      ))}
    </div>
  );
}

export function Timeline({ items }) {
  return (
    <div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i === items.length - 1 ? 0 : 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: it.color || T.blue,
                marginTop: 5,
              }}
            />
            {i !== items.length - 1 && (
              <div style={{ width: 1, flex: 1, background: T.border, marginTop: 4 }} />
            )}
          </div>
          <div style={{ paddingBottom: 4 }}>
            <div style={{ fontSize: 13.5, color: T.text, wordBreak: "keep-all", overflowWrap: "break-word" }}>{it.title}</div>
            <div style={{ fontSize: 12, color: T.textFaint, marginTop: 2 }}>{it.time}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Drawer({ open, onClose, items, active, onSelect, footer }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(20,24,40,0.35)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 200ms ease",
          zIndex: 20,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: 250,
          background: T.surface,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 220ms ease",
          zIndex: 21,
          padding: "22px 16px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <img
              src="/logo.png"
              alt="کیان"
              style={{ width: 24, height: 24, objectFit: "contain", filter: "drop-shadow(0 2px 4px rgba(20,30,60,0.25))" }}
            />
            <span style={{ fontWeight: 700, color: T.text, fontSize: 15 }}>کیان</span>
          </div>
          <button onClick={onClose} style={iconBtn}>
            <X size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => onSelect(it.key)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 12px",
                borderRadius: 12,
                border: "none",
                background: active === it.key ? T.blueSoft : "transparent",
                color: active === it.key ? T.blue : T.text,
                fontFamily: FONT,
                fontSize: 14,
                textAlign: "right",
                cursor: "pointer",
                marginBottom: 2,
              }}
            >
              {it.icon}
              <span style={{ wordBreak: "keep-all" }}>{it.label}</span>
            </button>
          ))}
        </div>
        {footer}
      </div>
    </>
  );
}

export function ThemeToggle({ dark, onToggle, size = 18 }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? "تم روشن" : "تم شب"}
      style={{
        border: `1px solid ${T.border}`,
        background: T.surface,
        color: T.text,
        borderRadius: 10,
        width: size + 16,
        height: size + 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      {dark ? <Sun size={size} /> : <Moon size={size} />}
    </button>
  );
}

export function TopHeader({ onMenu, title, dark, onToggleTheme }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 18px",
      }}
    >
      <button onClick={onMenu} style={iconBtn}>
        <Menu size={22} color={T.text} />
      </button>
      <span style={{ fontWeight: 700, fontSize: 15, color: T.text }}>{title || "کیان"}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
        <button style={iconBtn}>
          <Bell size={20} color={T.text} />
        </button>
      </div>
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 14.5, fontWeight: 700, color: T.text, margin: "22px 0 12px", wordBreak: "keep-all" }}>
      {children}
    </div>
  );
}

export function SectionTitleInline({ children }) {
  return <div style={{ fontSize: 14.5, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{children}</div>;
}

export function EmptyNote({ text }) {
  return (
    <div style={{ fontSize: 13, color: T.textFaint, padding: "18px 4px", textAlign: "center" }}>{text}</div>
  );
}

export function PlaceholderPage({ label, hint }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 6, wordBreak: "keep-all" }}>{label}</div>
      <div style={{ fontSize: 13, color: T.textFaint, wordBreak: "keep-all" }}>{hint}</div>
    </div>
  );
}

export function CheckRow({ label, sub, checked, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        borderRadius: 12,
        border: `1px solid ${checked ? T.blue : T.border}`,
        background: checked ? T.blueSoft : T.surface,
        marginBottom: 8,
        cursor: "pointer",
        textAlign: "right",
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          minWidth: 20,
          borderRadius: 6,
          border: `1px solid ${checked ? T.blue : T.border}`,
          background: checked ? T.blue : T.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && <Check size={13} color="#fff" />}
      </div>
      <div>
        <div style={{ fontSize: 13, color: T.text, wordBreak: "keep-all", overflowWrap: "break-word" }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: T.textFaint, marginTop: 2 }}>{sub}</div>}
      </div>
    </button>
  );
}

export function AccountCard({ name, username, role }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 18, padding: "20px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          {name.trim()[0]}
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text, wordBreak: "keep-all" }}>{name}</div>
          <div style={{ fontSize: 12.5, color: T.textSoft }}>{role}</div>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12, fontSize: 13, color: T.textSoft }}>
        نام کاربری: <span style={{ color: T.text }}>{username}</span>
      </div>
    </div>
  );
}

export function FollowUpRow({ name, item, status, statusColor, date }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderBottom: `1px solid ${T.border}` }}>
      <div>
        <div style={{ fontSize: 13.5, color: T.text, wordBreak: "keep-all" }}>{name}</div>
        <div style={{ fontSize: 12, color: T.textFaint, marginTop: 2, wordBreak: "keep-all" }}>{item}</div>
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 11.5, color: statusColor }}>{status}</div>
        <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>{date}</div>
      </div>
    </div>
  );
}
