import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeQuestion } from "@/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const questions = await prisma.question.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(questions.map(serializeQuestion));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const { text, options, correctIndex, explanation, similar, imageUrl } = body;

  if (!text?.trim() || !Array.isArray(options) || options.some((o) => !o?.trim())) {
    return NextResponse.json({ error: "متن سؤال و هر چهار گزینه را کامل کنید." }, { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      text: text.trim(),
      options,
      correctIndex: correctIndex ?? 0,
      explanation: explanation || "",
      similar: similar || undefined,
      imageUrl: imageUrl || null,
    },
  });

  return NextResponse.json(serializeQuestion(question), { status: 201 });
}
