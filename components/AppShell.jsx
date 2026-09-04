"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { T, FONT } from "./theme";
import { Drawer, TopHeader, ThemeToggle } from "./ui";
import { useIsDesktop } from "./responsive";

function Logomark({ size = 30 }) {
  return (
    <img
      src="/logo.png"
      alt="کیان"
      style={{
        width: size,
        height: size,
        minWidth: size,
        objectFit: "contain",
        filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.6)) drop-shadow(0 2px 4px rgba(20,30,60,0.25))",
      }}
    />
  );
}

function Sidebar({ items, active, onSelect, footer }) {
  return (
    <div
      style={{
        width: 248,
        minWidth: 248,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: T.surface,
        borderLeft: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        padding: "22px 16px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 6px", marginBottom: 30 }}>
        <Logomark />
        <span style={{ fontWeight: 800, fontSize: 17, color: T.text }}>کیان</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className="kian-nav-icon"
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 11,
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              background: active === it.key ? T.blueSoft : "transparent",
              color: active === it.key ? T.blue : T.text,
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: active === it.key ? 700 : 400,
              textAlign: "right",
              cursor: "pointer",
              transition: "background 150ms ease, color 150ms ease",
            }}
          >
            <span className="kian-nav-icon-inner" style={{ display: "flex" }}>{it.icon}</span>
            <span>{it.label}</span>
          </button>
        ))}
      </div>
      {footer}
    </div>
  );
}

function DesktopTopBar({ title, dark, onToggleTheme }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 40px",
        borderBottom: `1px solid ${T.border}`,
        background: T.surface,
      }}
    >
      <span style={{ fontWeight: 700, fontSize: 17, color: T.text }}>{title || "کیان"}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} />
        <button
          style={{
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: T.text,
            borderRadius: 10,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <Bell size={17} />
        </button>
      </div>
    </div>
  );
}

export function AppShell({ title, menu, active, onSelect, dark, onToggleTheme, children, footer }) {
  const isDesktop = useIsDesktop();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (isDesktop) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: T.bg, fontFamily: FONT }}>
        <Sidebar items={menu} active={active} onSelect={onSelect} footer={footer} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <DesktopTopBar title={title} dark={dark} onToggleTheme={onToggleTheme} />
          <div style={{ flex: 1, padding: "30px 40px 60px", maxWidth: 1040, width: "100%", margin: "0 auto", boxSizing: "border-box" }}>
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: 560, background: T.bg, fontFamily: FONT, overflow: "hidden" }}>
      <TopHeader onMenu={() => setDrawerOpen(true)} title={title} dark={dark} onToggleTheme={onToggleTheme} />
      <div style={{ padding: "0 18px 24px" }}>{children}</div>
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={menu}
        active={active}
        onSelect={(k) => {
          onSelect(k);
          setDrawerOpen(false);
        }}
        footer={footer}
      />
    </div>
  );
}

export { Logomark, Sidebar, DesktopTopBar };
