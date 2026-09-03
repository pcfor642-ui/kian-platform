"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { T, FONT } from "./theme";
import { fieldLabel, fieldInput, ThemeToggle } from "./ui";

export function LoginPage({ dark, onToggleTheme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username.trim() || !password.trim()) {
      setError("نام کاربری و رمز عبور را وارد کنید.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username: username.trim(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError("نام کاربری یا رمز عبور اشتباه است.");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(180deg, ${T.blueSoft} 0%, ${T.bg} 55%)`,
        padding: "32px 16px",
        fontFamily: FONT,
      }}
    >
      <div style={{ position: "absolute", top: 16, right: 16 }}>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} size={16} />
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${T.border}`,
          borderRadius: 24,
          padding: "36px 28px",
          boxShadow: "0 20px 50px -20px rgba(47,95,209,0.25)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="/logo.png"
            alt="کیان"
            style={{
              width: 76,
              height: 76,
              objectFit: "contain",
              margin: "0 auto 14px",
              display: "block",
              filter: "drop-shadow(0 1px 1px rgba(255,255,255,0.6)) drop-shadow(0 3px 8px rgba(20,30,60,0.22))",
            }}
          />
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em", color: T.text, margin: 0, wordBreak: "keep-all" }}>
            ورود به کیان
          </h1>
        </div>

        <div>
          <label style={fieldLabel}>نام کاربری</label>
          <input
            style={fieldInput}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="نام کاربری خود را وارد کنید"
            autoComplete="username"
          />
          <label style={{ ...fieldLabel, marginTop: 16 }}>رمز عبور</label>
          <input
            style={fieldInput}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="رمز عبور خود را وارد کنید"
            autoComplete="current-password"
          />

          {error && (
            <div style={{ color: T.danger, fontSize: 13, marginTop: 12, textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 22,
              padding: "13px 0",
              borderRadius: 14,
              border: "none",
              background: loading ? T.textFaint : T.amber,
              color: "#fff",
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </div>
      </div>
    </div>
  );
}
