import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serialize";

async function canManage(me, target) {
  if (me.role === "ADMIN") return true;
  if (me.role === "TEACHER" && target.role === "STUDENT" && target.teacherId === me.id) return true;
  return false;
}

export async function GET(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const me = session.user;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });

  const allowed =
    me.id === target.id ||
    (await canManage(me, target)) ||
    (me.role === "STUDENT" && me.teacherId === target.id);

  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  return NextResponse.json(serializeUser(target));
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const me = session.user;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!(await canManage(me, target))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json();
  const { firstName, lastName, username, password, status, teacherId } = body;

  if (!firstName?.trim() || !lastName?.trim() || !username?.trim()) {
    return NextResponse.json({ error: "همه‌ی فیلدها را پر کنید." }, { status: 400 });
  }

  if (username.trim() !== target.username) {
    const dup = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (dup) return NextResponse.json({ error: "این نام کاربری قبلاً استفاده شده است." }, { status: 409 });
  }

  const data = {
    name: `${firstName.trim()} ${lastName.trim()}`,
    username: username.trim(),
    active: status !== "غیرفعال",
  };
  if (password?.trim()) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }
  if (target.role === "STUDENT" && me.role === "ADMIN" && teacherId) {
    data.teacherId = teacherId;
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(serializeUser(updated));
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await params;
  const me = session.user;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!(await canManage(me, target))) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
