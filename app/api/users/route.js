import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeUser } from "@/lib/serialize";

export async function GET(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const role = new URL(req.url).searchParams.get("role");
  const me = session.user;

  if (role === "TEACHER") {
    if (me.role !== "ADMIN") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    const teachers = await prisma.user.findMany({ where: { role: "TEACHER" }, orderBy: { createdAt: "asc" } });
    return NextResponse.json(teachers.map(serializeUser));
  }

  if (role === "STUDENT") {
    if (me.role === "ADMIN") {
      const students = await prisma.user.findMany({ where: { role: "STUDENT" }, orderBy: { createdAt: "asc" } });
      return NextResponse.json(students.map(serializeUser));
    }
    if (me.role === "TEACHER") {
      const students = await prisma.user.findMany({
        where: { role: "STUDENT", teacherId: me.id },
        orderBy: { createdAt: "asc" },
      });
      return NextResponse.json(students.map(serializeUser));
    }
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: "role query param required" }, { status: 400 });
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = session.user;

  const body = await req.json();
  const { firstName, lastName, username, password, status, role, teacherId } = body;

  if (!firstName?.trim() || !lastName?.trim() || !username?.trim() || !password?.trim() || !role) {
    return NextResponse.json({ error: "همه‌ی فیلدها را پر کنید." }, { status: 400 });
  }
  if (role !== "TEACHER" && role !== "STUDENT") {
    return NextResponse.json({ error: "invalid role" }, { status: 400 });
  }
  if (role === "TEACHER" && me.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (role === "STUDENT" && me.role !== "ADMIN" && me.role !== "TEACHER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
  if (existing) {
    return NextResponse.json({ error: "این نام کاربری قبلاً استفاده شده است." }, { status: 409 });
  }

  let finalTeacherId = null;
  if (role === "STUDENT") {
    finalTeacherId = me.role === "TEACHER" ? me.id : teacherId || null;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name: `${firstName.trim()} ${lastName.trim()}`,
      username: username.trim(),
      passwordHash,
      role,
      active: status !== "غیرفعال",
      teacherId: finalTeacherId,
    },
  });

  return NextResponse.json(serializeUser(user), { status: 201 });
}
