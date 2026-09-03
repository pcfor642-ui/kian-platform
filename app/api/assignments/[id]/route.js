import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeAssignment } from "@/lib/serialize";

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await req.json();
  const { title, description, duration, expiresAt, questionIds, studentIds, status } = body;

  if (!title?.trim()) return NextResponse.json({ error: "عنوان را وارد کنید." }, { status: 400 });
  if (!Array.isArray(questionIds) || questionIds.length === 0)
    return NextResponse.json({ error: "حداقل یک سؤال انتخاب کنید." }, { status: 400 });
  if (!Array.isArray(studentIds) || studentIds.length === 0)
    return NextResponse.json({ error: "حداقل یک دانش‌آموز را انتخاب کنید." }, { status: 400 });

  const updated = await prisma.assignment.update({
    where: { id },
    data: {
      title: title.trim(),
      description: existing.type === "EXERCISE" ? description || "" : null,
      duration: existing.type === "EXAM" ? Number(duration) || 20 : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      questionIds,
      studentIds,
      active: status !== "غیرفعال",
    },
  });

  return NextResponse.json(serializeAssignment(updated));
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (session.user.role === "STUDENT") return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  await prisma.assignment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
