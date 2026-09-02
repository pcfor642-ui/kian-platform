import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req) {
  const session = await auth();
  if (!session || session.user.role === "STUDENT") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ai_disabled" }, { status: 503 });
  }

  const { raw } = await req.json();
  if (!raw?.trim()) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const prompt =
    'متن زیر یک سؤال چهارگزینه‌ای فارسی است، حتی اگر غلط املایی داشته باشد یا همه در یک خط پشت‌سرهم نوشته شده باشد. آن را تحلیل کن و فقط یک JSON با همین ساختار برگردان، بدون هیچ توضیح اضافه و بدون بک‌تیک:\n' +
    '{"text":"متن پرسش (تصحیح‌شده از نظر نگارشی)","options":["گزینه یک","گزینه دو","گزینه سه","گزینه چهار"],"correctIndex":0,"explanation":""}\n' +
    "اگر پاسخ صحیح در متن مشخص نبود correctIndex را 0 بگذار. اگر توضیحی نبود explanation را خالی بگذار.\n" +
    'متن ورودی: """' + raw + '"""';

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "ai_error" }, { status: 502 });
    }

    const data = await response.json();
    const out = (data.content || []).map((b) => b.text || "").join("");
    const clean = out.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json({
      text: parsed.text || "",
      options: [0, 1, 2, 3].map((i) => (parsed.options && parsed.options[i]) || ""),
      correctIndex: typeof parsed.correctIndex === "number" ? parsed.correctIndex : 0,
      explanation: parsed.explanation || "",
    });
  } catch (e) {
    return NextResponse.json({ error: "ai_error" }, { status: 502 });
  }
}
