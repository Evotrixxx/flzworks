import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ folder: string; file: string }>;
};

const contentTypes: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(_: Request, context: RouteContext) {
  const { folder, file } = await context.params;

  // Prevent path traversal attacks
  const cleanFolder = path.basename(folder);
  const cleanFile = path.basename(file);

  if (cleanFolder !== folder || cleanFile !== file) {
    return NextResponse.json({ error: "Invalid path segment." }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "Media", "Portfolio", cleanFolder, cleanFile);

  try {
    const data = await readFile(filePath);
    const extension = path.extname(cleanFile).toLowerCase();

    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": contentTypes[extension] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error(`Failed to serve portfolio media file at ${filePath}:`, error);
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
