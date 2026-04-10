import { NextRequest, NextResponse } from "next/server";
import { api } from "../client"; // Adjust path to your axios client if needed

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
    // The frontend sends: /api/get_images_names?siteId=123&file=abcd.jpg
    // We need to extract "abcd.jpg" to match it against Ditto's "/uploads/site_image/123/abcd.jpg"
    let targetFilename = "";
    if (imageUrl.includes("file=")) {
      // Safely extract the file parameter from the query string
      targetFilename = imageUrl.split("file=")[1].split("&")[0];
    } else {
      targetFilename = imageUrl.split("/").pop() || "";
    }

    const thingId = `in.codez.telecom:${siteId}`;
    const attrPath = `things/${thingId}/attributes/images`;

    // ── 2. Fetch current images from Ditto ──
    const getResponse = await api.get(attrPath, {
      baseURL: "http://138.201.137.244:5500/api/2/", // Force absolute URL for server-side Axios
    });

    const images: any[] = getResponse.data || [];

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No images found to update" },
        { status: 404 },
      );
    }

    // ── 3. Enforce single default logic ──
    let matchFound = false;

    const updatedImages = images.map((img) => {
      // Check if the stored Ditto URL ends with the target filename
      const isTarget = img.url.endsWith(targetFilename);

      if (isTarget) matchFound = true;

      return {
        ...img,
        default: isTarget, // This guarantees ONLY the matched image is true, all others become false
      };
    });

    if (!matchFound) {
      return NextResponse.json(
        { error: "Image reference not found in database" },
        { status: 404 },
      );
    }

    // ── 4. Save the updated array back to Ditto ──
    await api.put(attrPath, updatedImages, {
      baseURL: "http://138.201.137.244:5500/api/2/", // Force absolute URL for server-side Axios
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🚨 DITTO SET DEFAULT ERROR 🚨", {
      message: error.message,
      data: error.response?.data,
    });
    return NextResponse.json(
      { error: "Failed to update default image" },
      { status: 500 },
    );
  }
}
