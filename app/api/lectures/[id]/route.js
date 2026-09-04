import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const lecture = await prisma.lecture.findUnique({ where: { id } });
  if (!lecture) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (session.user.role === "TEACHER" && lecture.teacherId !== session.user.id) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  await prisma.lecture.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
