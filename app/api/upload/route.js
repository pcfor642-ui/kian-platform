import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadFile, isStorageConfigured } from "@/lib/storage";

const KINDS = {
  "question-image": { folder: "questions", accept: ["image/"], maxBytes: 8 * 1024 * 1024 },
  "chat-attachment": { folder: "chat", accept: ["image/", "audio/", "video/"], maxBytes: 25 * 1024 * 1024 },
  "lecture-video": { folder: "lectures", accept: ["video/"], maxBytes: 200 * 1024 * 1024 },
};

export async function POST(req) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "آپلود فایل روی این سرور فعال نیست." }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const kind = form.get("kind");
  const spec = KINDS[kind];

  if (!file || !spec) return NextResponse.json({ error: "درخواست نامعتبر است." }, { status: 400 });
  if (kind === "lecture-video" && session.user.role === "STUDENT") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const type = file.type || "application/octet-stream";
  if (!spec.accept.some((prefix) => type.startsWith(prefix))) {
    return NextResponse.json({ error: "نوع فایل مجاز نیست." }, { status: 400 });
  }
  if (file.size > spec.maxBytes) {
    return NextResponse.json({ error: `حجم فایل نباید بیشتر از ${Math.round(spec.maxBytes / 1024 / 1024)} مگابایت باشد.` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = (file.name || "file").replace(/[^\w.\-]+/g, "_").slice(-80);

  try {
    const { url } = await uploadFile({ folder: spec.folder, filename: safeName, buffer, contentType: type });
    return NextResponse.json({ url, type });
  } catch (e) {
    return NextResponse.json({ error: "آپلود فایل با خطا مواجه شد." }, { status: 502 });
  }
}
