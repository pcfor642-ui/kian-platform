import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeAssignment } from "@/lib/serialize";

function typeFromQuery(v) {
  if (v === "exam") return "EXAM";
  if (v === "exercise") return "EXERCISE";
  return null;
}

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const type = typeFromQuery(new URL(req.url).searchParams.get("type"));
  if (!type) return NextResponse.json({ error: "type query param required (exercise|exam)" }, { status: 400 });

  const me = session.user;

  let items;
  if (me.role === "ADMIN" || me.role === "TEACHER") {
    items = await prisma.assignment.findMany({ where: { type }, orderBy: { createdAt: "desc" } });
  } else {
    items = await prisma.assignment.findMany({
      where: { type, studentIds: { has: me.id } },
      orderBy: { createdAt: "desc" },
    });
  }

  return NextResponse.json(items.map(serializeAssignment));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const type = typeFromQuery(body.type);
  if (!type) return NextResponse.json({ error: "type is required (exercise|exam)" }, { status: 400 });

  const { title, description, duration, questionIds, studentIds, status } = body;

  if (!title?.trim()) return NextResponse.json({ error: "عنوان را وارد کنید." }, { status: 400 });
  if (!Array.isArray(questionIds) || questionIds.length === 0)
    return NextResponse.json({ error: "حداقل یک سؤال انتخاب کنید." }, { status: 400 });
  if (!Array.isArray(studentIds) || studentIds.length === 0)
    return NextResponse.json({ error: "حداقل یک دانش‌آموز را انتخاب کنید." }, { status: 400 });

  const assignment = await prisma.assignment.create({
    data: {
      type,
      title: title.trim(),
      description: type === "EXERCISE" ? description || "" : null,
      duration: type === "EXAM" ? Number(duration) || 20 : null,
      questionIds,
      studentIds,
      active: status !== "غیرفعال",
    },
  });

  return NextResponse.json(serializeAssignment(assignment), { status: 201 });
}
