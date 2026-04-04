import { NextRequest, NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const siteId = searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ urls: [] }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "site_image", siteId);

  try {
    const files = await readdir(dir);

    const urls = files.map((file) => `/site_image/${siteId}/${file}`);

    return NextResponse.json({ urls });
  } catch {
    // folder not found or empty
    return NextResponse.json({ urls: [] });
  }
}
