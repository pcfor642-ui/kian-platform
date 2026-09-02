import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeQuestion } from "@/lib/serialize";

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { text, options, correctIndex, explanation, similar } = body;

  if (!text?.trim() || !Array.isArray(options) || options.some((o) => !o?.trim())) {
    return NextResponse.json({ error: "متن سؤال و هر چهار گزینه را کامل کنید." }, { status: 400 });
  }

  const question = await prisma.question.update({
    where: { id },
    data: {
      text: text.trim(),
      options,
      correctIndex: correctIndex ?? 0,
      explanation: explanation || "",
      similar: similar ?? null,
    },
  });

  return NextResponse.json(serializeQuestion(question));
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
