import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  upsert: vi.fn(),
}));

vi.mock("server-only", () => ({}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    flzSetting: prismaMocks,
  },
}));

import {
  DEFAULT_SOCIAL,
  SOCIAL_CONFIG_KEY,
  readSocialConfig,
  writeSocialConfig,
} from "@/lib/social-config";

describe("Studio social configuration persistence", () => {
  beforeEach(() => {
    prismaMocks.findUnique.mockReset();
    prismaMocks.upsert.mockReset();
  });

  it("returns defaults when no database setting exists", async () => {
    prismaMocks.findUnique.mockResolvedValue(null);

    await expect(readSocialConfig()).resolves.toEqual(DEFAULT_SOCIAL);
    expect(prismaMocks.findUnique).toHaveBeenCalledWith({
      where: { key: SOCIAL_CONFIG_KEY },
      select: { value: true },
    });
  });

  it("stores the complete configuration in the namespaced setting", async () => {
    prismaMocks.upsert.mockResolvedValue({});
    const entries = DEFAULT_SOCIAL.map((entry) => ({
      ...entry,
      postUrl: `https://example.com/${entry.platform}`,
    }));

    await writeSocialConfig(entries);

    expect(prismaMocks.upsert).toHaveBeenCalledWith({
      where: { key: SOCIAL_CONFIG_KEY },
      create: { key: SOCIAL_CONFIG_KEY, value: JSON.stringify(entries) },
      update: { value: JSON.stringify(entries) },
    });
  });

  it("merges valid saved values over stable platform defaults", async () => {
    prismaMocks.findUnique.mockResolvedValue({
      value: JSON.stringify([
        {
          platform: "instagram",
          label: "IG — @VISION.FLZ",
          postUrl: "https://instagram.com/vision.flz",
          imageUrl: "/media/instagram.webp",
        },
      ]),
    });

    const result = await readSocialConfig();
    expect(result).toHaveLength(3);
    expect(result.some((entry) => (entry.platform as string) === "x")).toBe(false);
    expect(result.find((entry) => entry.platform === "instagram")).toMatchObject({
      label: "IG — @VISION.FLZ",
      imageUrl: "/media/instagram.webp",
    });
  });
});
