import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import sharp from "sharp";

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

const RESIZABLE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"]);
const MAX_WIDTH = 2400;

export async function GET(request: Request, context: RouteContext) {
  const { folder, file } = await context.params;

  // Prevent path traversal attacks
  const cleanFolder = path.basename(folder);
  const cleanFile = path.basename(file);

  if (cleanFolder !== folder || cleanFile !== file) {
    return NextResponse.json({ error: "Invalid path segment." }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "Media", "Portfolio", cleanFolder, cleanFile);
  const extension = path.extname(cleanFile).toLowerCase();

  const { searchParams } = new URL(request.url);
  const requestedWidth = Number(searchParams.get("w"));
  const width = Number.isFinite(requestedWidth) && requestedWidth > 0
    ? Math.min(Math.round(requestedWidth), MAX_WIDTH)
    : null;

  try {
    const data = await readFile(filePath);

    if (width && RESIZABLE_EXTENSIONS.has(extension)) {
      const resized = await sharp(data)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();

      return new Response(new Uint8Array(resized), {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

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
