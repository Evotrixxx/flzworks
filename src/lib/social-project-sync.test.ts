import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    flzProject: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    flzSetting: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
  },
}));
vi.mock("./prisma", () => ({ prisma: prismaMock }));

import {
  normalizeInstagramPost,
  normalizeTikTokPost,
  persistPosts,
  selectUnseenSocialPosts,
  type NormalizedSocialPost,
} from "./social-project-sync";

describe("social project normalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.flzSetting.findMany.mockResolvedValue([]);
  });

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

  it("selects only new provider posts and preserves existing Studio projects", () => {
    const posts: NormalizedSocialPost[] = [
      {
        platform: "instagram",
        postId: "already-edited-in-studio",
        title: "Provider title must not win",
        body: "Provider body must not win",
        publishedAt: null,
        linkUrl: "https://www.instagram.com/p/existing/",
        imageUrl: "https://cdn.example/existing.jpg",
      },
      {
        platform: "instagram",
        postId: "new-post",
        title: "New public post",
        body: null,
        publishedAt: null,
        linkUrl: "https://www.instagram.com/p/new/",
        imageUrl: "https://cdn.example/new.jpg",
      },
    ];

    expect(selectUnseenSocialPosts(posts, ["already-edited-in-studio"])).toEqual([posts[1]]);
  });

  it("persists new posts without writing existing Studio projects", async () => {
    const posts: NormalizedSocialPost[] = [
      {
        platform: "instagram",
        postId: "existing",
        title: "Provider must not overwrite Studio",
        body: "Provider body",
        publishedAt: null,
        linkUrl: "https://www.instagram.com/p/existing/",
        imageUrl: null,
      },
      {
        platform: "instagram",
        postId: "new",
        title: "New post",
        body: null,
        publishedAt: null,
        linkUrl: "https://www.instagram.com/p/new/",
        imageUrl: null,
      },
    ];
    prismaMock.flzProject.findMany.mockResolvedValue([{ socialPostId: "existing" }]);
    prismaMock.flzProject.create.mockResolvedValue({ id: "created" });

    await expect(persistPosts("instagram", posts)).resolves.toEqual({
      created: 1,
      updated: 0,
      hidden: 0,
    });
    expect(prismaMock.flzProject.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.flzProject.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ socialPostId: "new", title: "New post" }),
    });
  });

  it("does not recreate an imported post deleted in Studio", async () => {
    const deletedPost: NormalizedSocialPost = {
      platform: "tiktok",
      postId: "deleted-in-studio",
      title: "Provider row",
      body: null,
      publishedAt: null,
      linkUrl: "https://www.tiktok.com/@vision.flz/video/deleted-in-studio",
      imageUrl: null,
    };
    prismaMock.flzProject.findMany.mockResolvedValue([]);
    prismaMock.flzSetting.findMany.mockResolvedValue([
      { key: "social-project-tombstone:tiktok:deleted-in-studio" },
    ]);

    await expect(persistPosts("tiktok", [deletedPost])).resolves.toEqual({
      created: 0,
      updated: 0,
      hidden: 0,
    });
    expect(prismaMock.flzProject.create).not.toHaveBeenCalled();
  });
});
