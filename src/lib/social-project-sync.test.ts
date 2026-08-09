import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./prisma", () => ({ prisma: {} }));

import { normalizeInstagramPost, normalizeTikTokPost } from "./social-project-sync";

describe("social project normalization", () => {
  it("turns an Instagram reel into a linked project with its thumbnail", () => {
    const post = normalizeInstagramPost({
      id: "ig-42",
      caption: "Fresh MUNCA lighting pass\n#godot #gamedev",
      media_type: "VIDEO",
      media_url: "https://cdn.example/video.mp4",
      thumbnail_url: "https://cdn.example/cover.jpg",
      permalink: "https://www.instagram.com/reel/example/",
      timestamp: "2026-08-09T08:30:00+0000",
    });

    expect(post).toMatchObject({
      platform: "instagram",
      postId: "ig-42",
      title: "Fresh MUNCA lighting pass",
      imageUrl: "https://cdn.example/cover.jpg",
      linkUrl: "https://www.instagram.com/reel/example/",
    });
    expect(post?.publishedAt?.toISOString()).toBe("2026-08-09T08:30:00.000Z");
  });

  it("turns a TikTok video into a linked project", () => {
    const post = normalizeTikTokPost({
      id: "tt-99",
      video_description: "Building the new garage",
      cover_image_url: "https://cdn.example/tiktok.jpg",
      share_url: "https://www.tiktok.com/@vision.flz/video/99",
      create_time: 1_754_728_200,
    });

    expect(post).toMatchObject({
      platform: "tiktok",
      postId: "tt-99",
      title: "Building the new garage",
      body: "Building the new garage",
      linkUrl: "https://www.tiktok.com/@vision.flz/video/99",
    });
  });

  it("rejects provider rows that cannot link to the original post", () => {
    expect(normalizeInstagramPost({ id: "ig", media_type: "IMAGE" })).toBeNull();
    expect(normalizeTikTokPost({ id: "tt" })).toBeNull();
  });
});
