import { NextRequest, NextResponse } from "next/server";
import { readdir, readFile } from "fs/promises";
import path from "path";

const mimeTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");
  const file = searchParams.get("file");

  if (!siteId) {
    return NextResponse.json({ urls: [] }, { status: 400 });
  }

  // ── Serve single image ──
  if (file) {
    if (file.includes("..") || siteId.includes("..")) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    const filePath = path.join(
      process.cwd(),
      "uploads",
      "site_image",
      siteId,
      file,
    );
    try {
      const buffer = await readFile(filePath);
      const ext = path.extname(file).toLowerCase();
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeTypes[ext] ?? "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    } catch {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  // ── List all images ──
  const dir = path.join(process.cwd(), "uploads", "site_image", siteId);
  try {
    const files = await readdir(dir);
    const urls = files.map(
      (f) => `/api/get_images_names?siteId=${siteId}&file=${f}`,
    );
    return NextResponse.json({ urls });
  } catch {
    return NextResponse.json({ urls: [] });
  }
}
