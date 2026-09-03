"use client";

import { Star } from "lucide-react";
import { T, FONT } from "./theme";

const STAR_COUNT = 11;

function starPositions() {
  const positions = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const angle = (i / STAR_COUNT) * Math.PI * 2 + (i % 2 === 0 ? 0.25 : -0.2);
    const distance = 70 + (i % 3) * 26;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rot = (i % 2 === 0 ? 1 : -1) * (40 + i * 8);
    const delay = i * 55;
    positions.push({ dx, dy, rot, delay, size: 10 + (i % 3) * 3 });
  }
  return positions;
}

const STARS = starPositions();

export function LoadingScreen({ label = "در حال بارگذاری" }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        background: T.bg,
        fontFamily: FONT,
      }}
    >
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {STARS.map((s, i) => (
          <Star
            key={i}
            size={s.size}
            className="kian-loading-star"
            fill="#E0242F"
            color="#E0242F"
            style={{
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}px`,
              "--rot": `${s.rot}deg`,
              "--delay": `${s.delay}ms`,
            }}
          />
        ))}
        <img
          src="/logo.png"
          alt="کیان"
          className="kian-loading-logo"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: "drop-shadow(0 6px 16px rgba(20,30,60,0.25))",
          }}
        />
      </div>
      <div style={{ fontSize: 13.5, color: T.textFaint, display: "flex", alignItems: "center", gap: 2 }}>
        {label}
        <span className="kian-loading-dot" style={{ animationDelay: "0ms" }}>.</span>
        <span className="kian-loading-dot" style={{ animationDelay: "150ms" }}>.</span>
        <span className="kian-loading-dot" style={{ animationDelay: "300ms" }}>.</span>
      </div>
    </div>
  );
}
