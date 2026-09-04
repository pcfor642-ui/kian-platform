import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeLecture } from "@/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = session.user;

  if (me.role === "STUDENT") {
    const lectures = await prisma.lecture.findMany({
      where: { studentIds: { has: me.id } },
      orderBy: { createdAt: "desc" },
    });
    const myViews = await prisma.lectureView.findMany({
      where: { studentId: me.id, lectureId: { in: lectures.map((l) => l.id) } },
    });
    const viewByLecture = new Map(myViews.map((v) => [v.lectureId, v]));
    return NextResponse.json(lectures.map((l) => serializeLecture(l, { myView: viewByLecture.get(l.id) || null })));
  }

  const where = me.role === "TEACHER" ? { teacherId: me.id } : {};
  const lectures = await prisma.lecture.findMany({ where, orderBy: { createdAt: "desc" }, include: { views: true } });
  return NextResponse.json(lectures.map((l) => serializeLecture(l, { views: l.views })));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { title, videoUrl, studentIds } = await req.json();
  if (!title?.trim() || !videoUrl) return NextResponse.json({ error: "عنوان و ویدیو را کامل کنید." }, { status: 400 });
  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    return NextResponse.json({ error: "حداقل یک دانش‌آموز را انتخاب کنید." }, { status: 400 });
  }

  const lecture = await prisma.lecture.create({
    data: { title: title.trim(), videoUrl, teacherId: session.user.id, studentIds },
  });

  return NextResponse.json(serializeLecture(lecture, { views: [] }), { status: 201 });
}
