import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeResult } from "@/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = session.user;

  let results;
  if (me.role === "ADMIN") {
    results = await prisma.result.findMany({ orderBy: { createdAt: "desc" } });
  } else if (me.role === "TEACHER") {
    const students = await prisma.user.findMany({ where: { role: "STUDENT", teacherId: me.id }, select: { id: true } });
    const ids = students.map((s) => s.id);
    results = await prisma.result.findMany({ where: { studentId: { in: ids } }, orderBy: { createdAt: "desc" } });
  } else {
    results = await prisma.result.findMany({ where: { studentId: me.id }, orderBy: { createdAt: "desc" } });
  }

  return NextResponse.json(results.map(serializeResult));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role !== "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const { assignmentId, type, correctCount, wrongCount, unansweredCount, percentage, answerDetail } = body;

  if (!assignmentId || !type) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
  if (!assignment || !assignment.studentIds.includes(session.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const result = await prisma.result.create({
    data: {
      studentId: session.user.id,
      assignmentId,
      title: assignment.title,
      type: type === "exam" ? "EXAM" : "EXERCISE",
      percentage: percentage ?? 0,
      correctCount: correctCount ?? 0,
      wrongCount: wrongCount ?? 0,
      unansweredCount: unansweredCount ?? 0,
      answerDetail: Array.isArray(answerDetail) ? answerDetail : undefined,
    },
  });

  return NextResponse.json(serializeResult(result), { status: 201 });
}
