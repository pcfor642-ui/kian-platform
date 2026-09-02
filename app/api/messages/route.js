import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serializeMessage } from "@/lib/serialize";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = session.user.id;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: me }, { receiverId: me }] },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(messages.map(serializeMessage));
}

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const me = session.user;

  const body = await req.json();
  const { receiverId, text } = body;
  if (!receiverId || !text?.trim()) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
  if (!receiver) return NextResponse.json({ error: "not found" }, { status: 404 });

  const allowed =
    (me.role === "ADMIN" && (receiver.role === "TEACHER" || receiver.role === "STUDENT")) ||
    (me.role === "TEACHER" && receiver.role === "STUDENT" && receiver.teacherId === me.id) ||
    (me.role === "TEACHER" && receiver.role === "ADMIN") ||
    (me.role === "STUDENT" && receiver.id === me.teacherId) ||
    (me.role === "STUDENT" && receiver.role === "ADMIN");

  if (!allowed) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const message = await prisma.message.create({
    data: { senderId: me.id, receiverId, text: text.trim() },
  });

  return NextResponse.json(serializeMessage(message), { status: 201 });
}
