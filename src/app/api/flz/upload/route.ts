import { NextRequest, NextResponse } from "next/server";
import { verifyAdminUser } from "@/lib/flz-security";
import { saveUploadedPhotos } from "@/lib/uploads";

/**
 * Accepts one image from the studio and returns the path to store on the
 * project. Files land in the same upload root the `/media/[file]` route serves.
 */
export async function POST(request: NextRequest) {
  const auth = await verifyAdminUser();

  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json({ error: "No image was uploaded." }, { status: 400 });
    }

    const [saved] = await saveUploadedPhotos([file]);

    if (!saved) {
      return NextResponse.json({ error: "The image could not be stored." }, { status: 400 });
    }

    return NextResponse.json({ success: true, url: `/media/${encodeURIComponent(saved)}` });
  } catch (error) {
    // saveUploadedPhotos throws with a readable reason for type/size rejections.
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
