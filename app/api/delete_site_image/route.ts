import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { api } from "../client";

export async function POST(req: NextRequest) {
  try {
    const { siteId, imageUrl } = await req.json();

    if (!siteId || !imageUrl) {
      return NextResponse.json(
        { error: "Missing siteId or imageUrl" },
        { status: 400 },
      );
    }

    // ── 1. Extract the actual filename ──
    let targetFilename = "";
    if (imageUrl.includes("file=")) {
      targetFilename = imageUrl.split("file=")[1].split("&")[0];
    } else {
      targetFilename = imageUrl.split("/").pop() || "";
    }

    const thingId = `in.codez.telecom:${siteId}`;
    const attrPath = `things/${thingId}/attributes/images`;

    // ── 2. Fetch current images from Ditto ──
    let images: any[] = [];
    try {
      const getResponse = await api.get(attrPath, {
        baseURL:
          process.env.API_BASE_URL || "http://138.201.137.244:5500/api/2/", // Force absolute URL
      });
      images = getResponse.data || [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: "No images found for this site" },
          { status: 404 },
        );
      }
      throw error;
    }

    // ── 3. Find the image and filter it out ──
    const imageToDelete = images.find((img) =>
      img.url.endsWith(targetFilename),
    );

    if (!imageToDelete) {
      return NextResponse.json(
        { error: "Image reference not found in database" },
        { status: 404 },
      );
    }

    const updatedImages = images.filter(
      (img) => !img.url.endsWith(targetFilename),
    );

    // ── 4. Delete the physical file from disk ──
    // imageToDelete.url looks like "/uploads/site_image/123/abcd.jpg"
    const fullFilePath = path.join(process.cwd(), imageToDelete.url);

    try {
      await unlink(fullFilePath);
    } catch (fsError: any) {
      // If the file is already missing from the disk, we just log a warning
      // but proceed to clean up the database anyway so it doesn't stay stuck.
      console.warn(
        "File already missing on disk, continuing DB cleanup:",
        fullFilePath,
      );
    }

    // ── 5. Save the updated array back to Ditto ──
    await api.put(attrPath, updatedImages, {
      baseURL: process.env.API_BASE_URL || "http://138.201.137.244:5500/api/2/", // Force absolute URL
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🚨 DITTO DELETE ERROR 🚨", {
      message: error.message,
      data: error.response?.data,
    });
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
