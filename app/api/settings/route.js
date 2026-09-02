import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOrCreateSettings() {
  let settings = await prisma.schoolSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    settings = await prisma.schoolSettings.create({ data: { id: 1 } });
  }
  return settings;
}

export async function GET() {
  const settings = await getOrCreateSettings();
  return NextResponse.json({
    schoolName: settings.schoolName,
    tagline: settings.tagline,
    supportContact: settings.supportContact,
  });
}

export async function PUT(req) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { schoolName, tagline, supportContact } = body;

  await getOrCreateSettings();
  const settings = await prisma.schoolSettings.update({
    where: { id: 1 },
    data: {
      schoolName: schoolName || "",
      tagline: tagline || "",
      supportContact: supportContact || "",
    },
  });

  return NextResponse.json({
    schoolName: settings.schoolName,
    tagline: settings.tagline,
    supportContact: settings.supportContact,
  });
}
