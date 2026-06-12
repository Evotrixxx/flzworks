import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
export const allowedPhotoTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type UploadValidationResult =
  | { ok: true; extension: string }
  | { ok: false; message: string };

export function uploadRoot() {
  return process.env.UPLOAD_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "uploads");
}

export function validatePhotoMeta(meta: { type: string; size: number }): UploadValidationResult {
  const extension = allowedPhotoTypes[meta.type as keyof typeof allowedPhotoTypes];

  if (!extension) {
    return { ok: false, message: "Unsupported image type." };
  }

  if (meta.size > MAX_PHOTO_SIZE_BYTES) {
    return { ok: false, message: "Image is larger than 5 MB." };
  }

  return { ok: true, extension };
}

export function safeUploadPath(filename: string) {
  const cleanName = path.basename(filename);
  return path.join(uploadRoot(), cleanName);
}

export async function saveUploadedPhotos(files: File[]) {
  await mkdir(uploadRoot(), { recursive: true });

  const saved: string[] = [];

  for (const file of files) {
    if (!file.name || file.size === 0) {
      continue;
    }

    const validation = validatePhotoMeta(file);

    if (!validation.ok) {
      throw new Error(validation.message);
    }

    const filename = `${randomUUID()}.${validation.extension}`;
    await writeFile(safeUploadPath(filename), Buffer.from(await file.arrayBuffer()));
    saved.push(filename);
  }

  return saved;
}

export async function readUploadedPhoto(filename: string) {
  return readFile(safeUploadPath(filename));
}

export async function removeUploadedPhoto(filename: string) {
  if (filename.startsWith("/")) {
    return;
  }

  try {
    await unlink(safeUploadPath(filename));
  } catch {
    // Missing local files should not block listing updates or deletion.
  }
}
