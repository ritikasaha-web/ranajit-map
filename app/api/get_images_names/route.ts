// import { NextRequest, NextResponse } from "next/server";
// import { readdir, readFile } from "fs/promises";
// import path from "path";

// const mimeTypes: Record<string, string> = {
//   ".jpg": "image/jpeg",
//   ".jpeg": "image/jpeg",
//   ".png": "image/png",
//   ".webp": "image/webp",
//   ".gif": "image/gif",
// };

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const siteId = searchParams.get("siteId");
//   const file = searchParams.get("file");

//   if (!siteId) {
//     return NextResponse.json({ urls: [] }, { status: 400 });
//   }

//   // ── Serve single image ──
//   if (file) {
//     if (file.includes("..") || siteId.includes("..")) {
//       return new NextResponse("Forbidden", { status: 403 });
//     }
//     const filePath = path.join(
//       process.cwd(),
//       "uploads",
//       "site_image",
//       siteId,
//       file,
//     );
//     try {
//       const buffer = await readFile(filePath);
//       const ext = path.extname(file).toLowerCase();
//       return new NextResponse(buffer, {
//         headers: {
//           "Content-Type": mimeTypes[ext] ?? "application/octet-stream",
//           "Cache-Control": "public, max-age=31536000, immutable",
//         },
//       });
//     } catch {
//       return new NextResponse("Not found", { status: 404 });
//     }
//   }

//   // ── List all images ──
//   const dir = path.join(process.cwd(), "uploads", "site_image", siteId);
//   try {
//     const files = await readdir(dir);
//     const urls = files.map(
//       (f) => `/api/get_images_names?siteId=${siteId}&file=${f}`,
//     );
//     return NextResponse.json({ urls });
//   } catch {
//     return NextResponse.json({ urls: [] });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { api_backend } from "../client"; // Ensure this matches your file path

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

  // ── Serve single image (Unchanged: Reads physical file from disk) ──
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

  // ── List all images (NEW: Fetches references from Ditto) ──
  try {
    const thingId = `in.codez.telecom:${siteId}`;
    const attrPath = `things/${thingId}/attributes/images`;

    // Force absolute URL for server-side Axios request
    const response = await api_backend.get(attrPath, {
      baseURL: "http://138.201.137.244:5500/api/2/",
    });

    const images = response.data || [];

    // Translate the Ditto stored paths back to the URL format the frontend expects
    const urls = images.map((img: any) => {
      // Extracts just "filename.jpg" from "/uploads/site_image/123/filename.jpg"
      const filename = img.url.split("/").pop();
      return `/api/get_images_names?siteId=${siteId}&file=${filename}`;
    });

    return NextResponse.json({ urls });
  } catch (error: any) {
    // If Ditto returns 404, it just means no images have been uploaded yet
    if (error.response?.status !== 404) {
      console.error("Ditto Fetch Error in GET:", error.message);
    }
    return NextResponse.json({ urls: [] });
  }
}
