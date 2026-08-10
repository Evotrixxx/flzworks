import { readFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const catalogPath = path.join(process.cwd(), "src", "data", "instagram-public-posts.json");
const posts = JSON.parse(await readFile(catalogPath, "utf8"));

if (process.argv.includes("--dry-run")) {
  const invalid = posts.filter((post) =>
    !post.postId || !post.title || !post.linkUrl?.startsWith("https://www.instagram.com/") ||
    !post.imageUrl?.startsWith("/social/instagram/"),
  );
  if (invalid.length > 0) {
    console.error(`${invalid.length} Instagram bootstrap rows are invalid.`);
    process.exit(1);
  }
  console.log(`Validated ${posts.length} Instagram bootstrap projects.`);
  process.exit(0);
}

const prisma = new PrismaClient();
try {
  // This is an explicit recovery/import command, never a deployment hook.
  // Existing rows belong to Studio and must remain byte-for-byte untouched.
  let created = 0;
  let preserved = 0;
  for (const post of posts) {
    const identity = {
      socialPlatform: "instagram-bootstrap",
      socialPostId: post.postId,
    };
    const tombstone = await prisma.flzSocialProjectTombstone.findUnique({
      where: { socialPlatform_socialPostId: identity },
      select: { id: true },
    });
    if (tombstone) {
      preserved += 1;
      continue;
    }
    const existing = await prisma.flzProject.findUnique({
      where: { socialPlatform_socialPostId: identity },
      select: { id: true },
    });
    if (existing) {
      preserved += 1;
      continue;
    }

    try {
      await prisma.flzProject.create({
        data: {
          title: post.title,
          tools: "Instagram",
          category: "Social",
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
          body: post.body || null,
          gradient: "linear-gradient(145deg,#833ab4,#fd1d1d 55%,#fcb045)",
          visible: true,
          featured: false,
          sortOrder: -1,
          linkUrl: post.linkUrl,
          imageUrl: post.imageUrl,
          ...identity,
        },
      });
      created += 1;
    } catch (error) {
      // A concurrent run may create the same row after findUnique. Preserve it.
      if (error?.code !== "P2002") throw error;
      preserved += 1;
    }
  }
  console.log(`Created ${created} missing Instagram projects; preserved ${preserved} existing Studio projects.`);
} finally {
  await prisma.$disconnect();
}
