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
// import { NextRequest, NextResponse } from "next/server";
// import { writeFile, mkdir, readdir, stat, unlink } from "fs/promises";
// import path from "path";
// import { randomUUID } from "crypto";

// export async function POST(req: NextRequest) {
//   const form = await req.formData();

//   const siteId = form.get("siteId") as string;
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

//   // ✅ Save uploaded files
//   for (const file of files) {
//     const ext = path.extname(file.name);
//     const filename = `${randomUUID()}${ext}`;

//     const buffer = Buffer.from(await file.arrayBuffer());
//     await writeFile(path.join(dir, filename), buffer);

//     urls.push(`/api/get_images_names?siteId=${siteId}&file=${filename}`);
//   }

//   // ✅ Enforce max 5 files per site
//   const filesInDir = await readdir(dir);

//   if (filesInDir.length > 5) {
//     const fileStats = await Promise.all(
//       filesInDir.map(async (file) => {
//         const filePath = path.join(dir, file);
//         const stats = await stat(filePath);
//         return { file, time: stats.mtime.getTime() };
//       }),
//     );

//     // Sort oldest first
//     fileStats.sort((a, b) => a.time - b.time);

//     // Delete extra files
//     const filesToDelete = fileStats.slice(0, fileStats.length - 5);

//     await Promise.all(filesToDelete.map((f) => unlink(path.join(dir, f.file))));
//   }

//   return NextResponse.json({ urls });
// }
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { api } from "../client";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const siteId = form.get("siteId") as string;

    // Grab ALL files from the form data
    const files = form.getAll("images") as File[];

    if (!files.length || !siteId) {
      return NextResponse.json(
        { error: "Missing files or siteId" },
        { status: 400 },
      );
    }

    const thingId = `in.codez.telecom:${siteId}`;
    const attrPath = `things/${thingId}/attributes/images`;

    // 1. Fetch current images from Ditto
    // 1. Fetch current images from Ditto
    let images: any[] = [];
    try {
      const response = await api.get(attrPath, {
        baseURL: "http://138.201.137.244:5500/api/2/",
      });
      images = response.data || [];
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.error("🚨 DITTO FETCH ERROR DETAILS 🚨", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          attemptedUrl: error.config?.url,
          baseURL: error.config?.baseURL,
        });
        throw new Error(`Communication with Ditto failed: ${error.message}`);
      }
    }

    // 2. Setup File System Directory
    const fullDirPath = path.join(
      process.cwd(),
      "uploads",
      "site_image",
      siteId,
    );
    await mkdir(fullDirPath, { recursive: true });

    const newEntries = [];

    // 3. Process ALL incoming files
    for (const file of files) {
      const ext = path.extname(file.name);
      const filename = `${randomUUID()}${ext}`;
      const relativePath = `/uploads/site_image/${siteId}/${filename}`;

      // Save physical file
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(fullDirPath, filename), buffer);

      // Create Ditto entry
      const newEntry = {
        url: relativePath,
        ts: Date.now(),
        default: false, // You can add logic for batch defaults if needed
      };

      newEntries.push(newEntry);

      // Artificial delay of 1ms to ensure unique timestamps for sorting later
      await new Promise((resolve) => setTimeout(resolve, 1));
    }

    // Combine old images with the new ones
    images = [...images, ...newEntries];

    // 4. Enforce Max 5 (FIFO)
    if (images.length > 5) {
      // Sort oldest first
      images.sort((a, b) => a.ts - b.ts);

      // Identify how many files we need to delete
      const overage = images.length - 5;

      // Splice takes the oldest X items out of the array
      const oldestImages = images.splice(0, overage);

      // Delete physical files for the removed entries
      for (const old of oldestImages) {
        const oldFilePath = path.join(process.cwd(), old.url);
        try {
          await unlink(oldFilePath);
        } catch (e) {
          console.warn(
            "File cleanup skipped (likely already deleted):",
            old.url,
          );
        }
      }
    }

    // 5. Update Ditto with the final clean array
    await api.put(attrPath, images);

    // Translate the raw paths to the API routes so the frontend can load them immediately
    const formattedUrls = newEntries.map((e) => {
      const filename = e.url.split("/").pop();
      return `/api/get_images_names?siteId=${siteId}&file=${filename}`;
    });

    return NextResponse.json({ success: true, urls: formattedUrls });
  } catch (error: any) {
    console.error("Critical API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
