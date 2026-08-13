import path from "path";
import { NextResponse } from "next/server";
import { contentTypeForPhoto, readUploadedPhoto } from "@/lib/uploads";

type RouteContext = {
  params: Promise<{ file: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { file } = await context.params;

  if (path.basename(file) !== file) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const data = await readUploadedPhoto(file);

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypeForPhoto(file),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
