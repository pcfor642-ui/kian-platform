import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { otherId } = await req.json();
  if (!otherId) return NextResponse.json({ error: "invalid payload" }, { status: 400 });

  await prisma.message.updateMany({
    where: { receiverId: session.user.id, senderId: otherId, isRead: false },
    data: { isRead: true },
  });

  return NextResponse.json({ ok: true });
}
