import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role !== "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const lecture = await prisma.lecture.findUnique({ where: { id } });
  if (!lecture || !lecture.studentIds.includes(session.user.id)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { watchedSeconds, durationSeconds } = await req.json();
  const watched = Math.max(0, Math.round(Number(watchedSeconds) || 0));
  const duration = Math.max(0, Math.round(Number(durationSeconds) || 0));
  const completed = duration > 0 && watched >= duration * 0.9;

  const existing = await prisma.lectureView.findUnique({
    where: { lectureId_studentId: { lectureId: id, studentId: session.user.id } },
  });

  const view = await prisma.lectureView.upsert({
    where: { lectureId_studentId: { lectureId: id, studentId: session.user.id } },
    update: {
      watchedSeconds: Math.max(watched, existing?.watchedSeconds || 0),
      durationSeconds: duration || existing?.durationSeconds || 0,
      completed: completed || existing?.completed || false,
    },
    create: { lectureId: id, studentId: session.user.id, watchedSeconds: watched, durationSeconds: duration, completed },
  });

  return NextResponse.json({ watchedSeconds: view.watchedSeconds, durationSeconds: view.durationSeconds, completed: view.completed });
}
