"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { T, FONT, applyTheme } from "./theme";
import { LoginPage } from "./LoginPage";
import { AdminApp } from "./AdminApp";
import { TeacherApp } from "./TeacherApp";
import { StudentApp } from "./StudentApp";

export function KianApp() {
  const { data: session, status } = useSession();
  const [dark, setDark] = useState(false);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    let isDark = false;
    try {
      isDark = window.localStorage.getItem("kian_theme") === "dark";
    } catch (e) {}
    applyTheme(isDark);
    setDark(isDark);
    setThemeReady(true);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    applyTheme(next);
    setDark(next);
    try {
      window.localStorage.setItem("kian_theme", next ? "dark" : "light");
    } catch (e) {}
  };

  if (status === "loading" || !themeReady) {
    return (
      <div style={{ minHeight: 560, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, fontFamily: FONT, color: T.textFaint }}>
        در حال بارگذاری...
      </div>
    );
  }

  const user = session?.user;

  return (
    <div
      dir="rtl"
      style={{ direction: "rtl", unicodeBidi: "isolate", maxWidth: 420, margin: "0 auto", boxShadow: `0 0 0 1px ${T.border}`, borderRadius: 26, overflow: "hidden" }}
    >
      {!user && <LoginPage dark={dark} onToggleTheme={toggleTheme} />}
      {user && user.role === "ADMIN" && (
        <AdminApp user={user} onLogout={() => signOut({ redirect: false })} dark={dark} onToggleTheme={toggleTheme} />
      )}
      {user && user.role === "TEACHER" && (
        <TeacherApp user={user} onLogout={() => signOut({ redirect: false })} dark={dark} onToggleTheme={toggleTheme} />
      )}
      {user && user.role === "STUDENT" && (
        <StudentApp user={user} onLogout={() => signOut({ redirect: false })} dark={dark} onToggleTheme={toggleTheme} />
      )}
    </div>
  );
}
