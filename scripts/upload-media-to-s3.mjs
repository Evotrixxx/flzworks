// One-time migration utility for copying legacy upload files to the Railway
// S3-compatible bucket. Object keys stay identical to the original filenames,
// so existing /media/<filename> URLs remain valid.
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function parseArgs(argv) {
  const args = { dir: null };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--dir") args.dir = argv[++index];
  }
  return args;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} must be set.`);
  return value;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function bodyToBuffer(body) {
  if (!body) throw new Error("S3 returned an empty object body.");
  const chunks = [];
  for await (const chunk of body) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function contentType(filename) {
  switch (path.extname(filename).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const sourceDir = path.resolve(args.dir || process.env.UPLOAD_DIR || "uploads");
  const bucket = requireEnv("S3_BUCKET");
  const client = new S3Client({
    endpoint: requireEnv("S3_ENDPOINT"),
    region: requireEnv("S3_REGION"),
    credentials: {
      accessKeyId: requireEnv("S3_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("S3_SECRET_ACCESS_KEY"),
    },
  });

  const entries = await readdir(sourceDir, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
  console.log(`Migrating ${files.length} files from ${sourceDir} to ${bucket}.`);

  for (const filename of files) {
    if (path.basename(filename) !== filename) throw new Error(`Unsafe filename: ${filename}`);
    const source = await readFile(path.join(sourceDir, filename));
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: source,
        ContentType: contentType(filename),
        Metadata: { sha256: sha256(source) },
      }),
    );

    const stored = await client.send(new GetObjectCommand({ Bucket: bucket, Key: filename }));
    const storedBuffer = await bodyToBuffer(stored.Body);
    if (source.length !== storedBuffer.length || sha256(source) !== sha256(storedBuffer)) {
      throw new Error(`Verification failed for ${filename}.`);
    }
    console.log(`  ${filename}: verified (${source.length} bytes)`);
  }

  console.log("Media migration and verification complete.");
}

main().catch((error) => {
  console.error("Media migration failed:", error);
  process.exit(1);
});
