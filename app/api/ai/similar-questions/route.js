import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { callClaude } from "@/lib/ai";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { text, options, correctIndex } = await req.json();
  if (!text?.trim() || !Array.isArray(options) || options.filter(Boolean).length < 2) {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const prompt =
    "این یک سؤال چهارگزینه‌ای فارسی برای دانش‌آموزان است:\n" +
    JSON.stringify({ text, options, correctIndex }) +
    "\n\nدقیقاً ۳ سؤال مشابه (هم‌سطح و با همان موضوع و مفهوم آموزشی، اما با اعداد/مثال متفاوت) بساز. " +
    "فقط یک آرایه‌ی JSON با همین ساختار برگردان، بدون هیچ توضیح اضافه و بدون بک‌تیک:\n" +
    '[{"text":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":""}, ...]';

  const { text: clean, error } = await callClaude(prompt, 1200);
  if (error) return NextResponse.json({ error }, { status: error === "ai_disabled" ? 503 : 502 });

  try {
    const parsed = JSON.parse(clean);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    const items = parsed
      .slice(0, 3)
      .map((p) => ({
        text: p.text || "",
        options: [0, 1, 2, 3].map((i) => (p.options && p.options[i]) || ""),
        correctIndex: typeof p.correctIndex === "number" ? p.correctIndex : 0,
        explanation: p.explanation || "",
      }))
      .filter((p) => p.text.trim());

    if (items.length === 0) throw new Error("empty");
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }
}
