import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const siteId = form.get("siteId") as string; // ✅ ADD THIS
  const files = form.getAll("images") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const dir = path.join(
    process.cwd(),
    "uploads",
    "site_image",
    siteId || "default",
  );

  await mkdir(dir, { recursive: true });

  const urls: string[] = [];

  for (const file of files) {
    const ext = path.extname(file.name);
    const filename = `${randomUUID()}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(path.join(dir, filename), buffer);

    urls.push(`/api/get_images_names?siteId=${siteId}&file=${filename}`);
  }

  return NextResponse.json({ urls });
}
