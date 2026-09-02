import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeExitEvent } from "@/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = session.user;
  if (me.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let events;
  if (me.role === "ADMIN") {
    events = await prisma.exitEvent.findMany({ orderBy: { createdAt: "desc" } });
  } else {
    const students = await prisma.user.findMany({ where: { role: "STUDENT", teacherId: me.id }, select: { id: true } });
    const ids = students.map((s) => s.id);
    events = await prisma.exitEvent.findMany({ where: { studentId: { in: ids } }, orderBy: { createdAt: "desc" } });
  }

  return NextResponse.json(events.map(serializeExitEvent));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role !== "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const { assignmentId, assignmentTitle } = body;
  if (!assignmentId) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const event = await prisma.exitEvent.create({
    data: {
      studentId: session.user.id,
      studentName: session.user.name,
      assignmentId,
      assignmentTitle: assignmentTitle || "",
    },
  });

  return NextResponse.json(serializeExitEvent(event), { status: 201 });
}
