import path from "path";
import { NextResponse } from "next/server";
import { readUploadedPhoto } from "@/lib/uploads";

type RouteContext = {
  params: Promise<{ file: string }>;
};

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

export async function GET(_: Request, context: RouteContext) {
  const { file } = await context.params;

  if (path.basename(file) !== file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const data = await readUploadedPhoto(file);
    const extension = path.extname(file).toLowerCase();

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
