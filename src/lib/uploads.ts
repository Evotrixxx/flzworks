import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

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

function s3Config() {
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const region = process.env.S3_REGION;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !endpoint || !region || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return { bucket, endpoint, region, accessKeyId, secretAccessKey };
}

let cachedClient: { client: S3Client; bucket: string } | null = null;

function s3Client() {
  const config = s3Config();
  if (!config) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Production media storage is not configured.");
    }
    return null;
  }

  if (!cachedClient) {
    cachedClient = {
      client: new S3Client({
        endpoint: config.endpoint,
        region: config.region,
        credentials: {
          accessKeyId: config.accessKeyId,
          secretAccessKey: config.secretAccessKey,
        },
      }),
      bucket: config.bucket,
    };
  }

  return cachedClient;
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<Buffer | string>) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const contentTypeByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export async function saveUploadedPhotos(files: File[]) {
  const s3 = s3Client();
  const saved: string[] = [];

  if (!s3) {
    await mkdir(uploadRoot(), { recursive: true });
  }

  for (const file of files) {
    if (!file.name || file.size === 0) {
      continue;
    }

    const validation = validatePhotoMeta(file);

    if (!validation.ok) {
      throw new Error(validation.message);
    }

    const filename = `${randomUUID()}.${validation.extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    if (s3) {
      await s3.client.send(
        new PutObjectCommand({
          Bucket: s3.bucket,
          Key: filename,
          Body: buffer,
          ContentType: file.type,
        }),
      );
    } else {
      await writeFile(safeUploadPath(filename), buffer);
    }

    saved.push(filename);
  }

  return saved;
}

export async function readUploadedPhoto(filename: string) {
  const cleanName = path.basename(filename);
  const s3 = s3Client();

  if (s3) {
    const response = await s3.client.send(
      new GetObjectCommand({ Bucket: s3.bucket, Key: cleanName }),
    );
    return streamToBuffer(response.Body);
  }

  return readFile(safeUploadPath(cleanName));
}

export function contentTypeForPhoto(filename: string) {
  const extension = path.extname(filename).toLowerCase().replace(/^\./, "");
  return contentTypeByExtension[extension] ?? "application/octet-stream";
}

export async function removeUploadedPhoto(filename: string) {
  if (filename.startsWith("/")) {
    return;
  }

  const cleanName = path.basename(filename);
  const s3 = s3Client();

  try {
    if (s3) {
      await s3.client.send(new DeleteObjectCommand({ Bucket: s3.bucket, Key: cleanName }));
    } else {
      await unlink(safeUploadPath(cleanName));
    }
  } catch {
    // Missing local files should not block listing updates or deletion.
  }
}
