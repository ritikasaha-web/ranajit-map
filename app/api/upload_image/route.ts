// import { NextRequest, NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
// import { randomUUID } from "crypto";

// export async function POST(req: NextRequest) {
//   const form = await req.formData();

//   const siteId = form.get("siteId") as string; // ✅ ADD THIS
//   const files = form.getAll("images") as File[];

//   if (!files.length) {
//     return NextResponse.json({ error: "No files" }, { status: 400 });
//   }

//   const dir = path.join(
//     process.cwd(),
//     "uploads",
//     "site_image",
//     siteId || "default",
//   );

//   await mkdir(dir, { recursive: true });

//   const urls: string[] = [];

//   for (const file of files) {
//     const ext = path.extname(file.name);
//     const filename = `${randomUUID()}${ext}`;

//     const buffer = Buffer.from(await file.arrayBuffer());

//     await writeFile(path.join(dir, filename), buffer);

//     urls.push(`/api/get_images_names?siteId=${siteId}&file=${filename}`);
//   }

//   return NextResponse.json({ urls });
// }
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, stat, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const form = await req.formData();

  const siteId = form.get("siteId") as string;
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

  // ✅ Save uploaded files
  for (const file of files) {
    const ext = path.extname(file.name);
    const filename = `${randomUUID()}${ext}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, filename), buffer);

    urls.push(`/api/get_images_names?siteId=${siteId}&file=${filename}`);
  }

  // ✅ Enforce max 5 files per site
  const filesInDir = await readdir(dir);

  if (filesInDir.length > 5) {
    const fileStats = await Promise.all(
      filesInDir.map(async (file) => {
        const filePath = path.join(dir, file);
        const stats = await stat(filePath);
        return { file, time: stats.mtime.getTime() };
      }),
    );

    // Sort oldest first
    fileStats.sort((a, b) => a.time - b.time);

    // Delete extra files
    const filesToDelete = fileStats.slice(0, fileStats.length - 5);

    await Promise.all(filesToDelete.map((f) => unlink(path.join(dir, f.file))));
  }

  return NextResponse.json({ urls });
}
