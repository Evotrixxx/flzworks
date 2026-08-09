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
  for (const post of posts) {
    await prisma.flzProject.upsert({
      where: {
        socialPlatform_socialPostId: {
          socialPlatform: "instagram-bootstrap",
          socialPostId: post.postId,
        },
      },
      create: {
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
        socialPlatform: "instagram-bootstrap",
        socialPostId: post.postId,
      },
      update: {
        title: post.title,
        tools: "Instagram",
        category: "Social",
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
        body: post.body || null,
        linkUrl: post.linkUrl,
        imageUrl: post.imageUrl,
        visible: true,
      },
    });
  }
  const saved = await prisma.flzProject.count({
    where: { socialPlatform: "instagram-bootstrap", visible: true },
  });
  console.log(`Bootstrapped ${saved} public Instagram projects.`);
} finally {
  await prisma.$disconnect();
}
