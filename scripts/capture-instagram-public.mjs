import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/capture-instagram-public.mjs <browser-export.json>");
  process.exit(1);
}

const workspace = process.cwd();
const outputDir = path.join(workspace, "public", "social", "instagram");
const catalogPath = path.join(workspace, "src", "data", "instagram-public-posts.json");
const sourcePosts = JSON.parse(await readFile(inputPath, "utf8"));

function decodeHtml(value = "") {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 10)))
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function metaContent(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(new RegExp(
    `<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']*)["']|` +
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${escaped}["']`,
    "i",
  ));
  return decodeHtml(match?.[1] || match?.[2] || "");
}

function postId(linkUrl) {
  return new URL(linkUrl).pathname.match(/\/(?:p|reel)\/([^/]+)/)?.[1] || null;
}

function captionFromTitle(value) {
  const marker = " on Instagram: ";
  const index = value.indexOf(marker);
  if (index < 0) return "";
  return value.slice(index + marker.length).replace(/^"|"$/g, "").trim();
}

function titleFromCaption(caption, fallback) {
  const firstLine = caption.split(/\r?\n/).map((line) => line.trim()).find(Boolean) || fallback;
  return firstLine.length <= 100 ? firstLine : `${firstLine.slice(0, 99).trimEnd()}…`;
}

function publishedAtFromDescription(value, fallback) {
  const match = value.match(/\bon ([A-Z][a-z]+ \d{1,2}, \d{4})(?:\s*[:.])/);
  const date = match ? new Date(`${match[1]} UTC`) : null;
  if (date && !Number.isNaN(date.valueOf())) return date.toISOString();

  const fallbackMatch = fallback.match(/\bon ([A-Z][a-z]+ \d{1,2}, \d{4})(?:\s*[:.])/);
  const fallbackDate = fallbackMatch ? new Date(`${fallbackMatch[1]} UTC`) : null;
  return fallbackDate && !Number.isNaN(fallbackDate.valueOf()) ? fallbackDate.toISOString() : null;
}

function extensionFor(contentType, sourceUrl) {
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("png")) return "png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const pathname = new URL(sourceUrl).pathname.toLowerCase();
  if (pathname.endsWith(".webp")) return "webp";
  if (pathname.endsWith(".png")) return "png";
  return "jpg";
}

await mkdir(outputDir, { recursive: true });
await mkdir(path.dirname(catalogPath), { recursive: true });

const catalog = [];
for (const source of sourcePosts) {
  const id = postId(source.href);
  if (!id || !source.imageUrl) continue;

  let html = "";
  try {
    const response = await fetch(source.href, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FLZWorks/1.0)" },
      signal: AbortSignal.timeout(20_000),
    });
    if (response.ok) html = await response.text();
  } catch (error) {
    console.warn(`Could not read caption for ${id}: ${error instanceof Error ? error.message : error}`);
  }

  const ogTitle = metaContent(html, "og:title");
  const ogDescription = metaContent(html, "og:description");
  const fallback = source.href.includes("/reel/") ? "Instagram reel" : "Instagram photo";
  const caption = captionFromTitle(ogTitle) || source.description.trim() || fallback;

  const imageResponse = await fetch(source.imageUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FLZWorks/1.0)" },
    signal: AbortSignal.timeout(30_000),
  });
  if (!imageResponse.ok) {
    console.warn(`Skipping ${id}: image returned HTTP ${imageResponse.status}`);
    continue;
  }

  const extension = extensionFor(imageResponse.headers.get("content-type") || "", source.imageUrl);
  const filename = `${id}.${extension}`;
  await writeFile(path.join(outputDir, filename), Buffer.from(await imageResponse.arrayBuffer()));

  catalog.push({
    postId: id,
    title: titleFromCaption(caption, fallback),
    body: caption,
    publishedAt: publishedAtFromDescription(ogDescription, source.description),
    linkUrl: source.href,
    imageUrl: `/social/instagram/${filename}`,
  });
  console.log(`Captured ${id}`);
}

await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
console.log(`Captured ${catalog.length} public Instagram posts.`);
