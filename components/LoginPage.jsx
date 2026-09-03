"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { T, FONT } from "./theme";
import { fieldLabel, ThemeToggle } from "./ui";

export function LoginPage({ dark, onToggleTheme }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const inputWithIconStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 44px 13px 16px",
    borderRadius: 14,
    border: `1.5px solid ${T.border}`,
    background: "rgba(255,255,255,0.85)",
    fontFamily: FONT,
    fontSize: 14,
    color: T.text,
    outline: "none",
    "--focus-ring-color": T.blue,
    "--focus-ring-glow": `${T.blue}22`,
  };

  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${T.blueSoft} 0%, ${T.bg} 55%)`,
        padding: "32px 16px",
        fontFamily: FONT,
      }}
    >
      <div
        className="kian-blob"
        style={{
          position: "absolute",
          top: "8%",
          right: "12%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background: T.blue,
          opacity: 0.16,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        className="kian-blob kian-blob-delay"
        style={{
          position: "absolute",
          bottom: "10%",
          left: "10%",
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: T.purple,
          opacity: 0.14,
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 2 }}>
        <ThemeToggle dark={dark} onToggle={onToggleTheme} size={16} />
      </div>

      <div
        className="kian-card-in"
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 360,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${T.border}`,
          borderRadius: 26,
          padding: "38px 28px",
          boxShadow: "0 25px 60px -20px rgba(47,95,209,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <img
            src="/logo.png"
            alt="کیان"
            className="kian-loading-logo"
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
          <div style={{ position: "relative" }}>
            <User size={17} color={T.textFaint} style={{ position: "absolute", top: 14, right: 15, pointerEvents: "none" }} />
            <input
              className="kian-input"
              style={inputWithIconStyle}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="نام کاربری خود را وارد کنید"
              autoComplete="username"
            />
          </div>

          <label style={{ ...fieldLabel, marginTop: 16 }}>رمز عبور</label>
          <div style={{ position: "relative" }}>
            <Lock size={17} color={T.textFaint} style={{ position: "absolute", top: 14, right: 15, pointerEvents: "none" }} />
            <input
              className="kian-input"
              style={{ ...inputWithIconStyle, padding: "13px 44px 13px 44px" }}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="رمز عبور خود را وارد کنید"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              style={{
                position: "absolute",
                top: 10,
                left: 10,
                border: "none",
                background: "transparent",
                color: T.textFaint,
                cursor: "pointer",
                padding: 4,
                display: "flex",
              }}
              aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && (
            <div style={{ color: T.danger, fontSize: 13, marginTop: 12, textAlign: "center" }}>
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="kian-btn-lift"
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
              boxShadow: loading ? "none" : `0 12px 26px -12px ${T.amber}`,
            }}
          >
            {loading ? "در حال ورود..." : "ورود"}
          </button>
        </div>
      </div>
    </div>
  );
}
