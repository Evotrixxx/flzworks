import { beforeEach, describe, expect, it, vi } from "vitest";

const setting = vi.hoisted(() => ({ findUnique: vi.fn(), upsert: vi.fn() }));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({ prisma: { flzSetting: setting } }));

import {
  getSocialMetricsSnapshot,
  readStoredSocialMetrics,
  writeStoredSocialMetrics,
} from "@/lib/social-metrics";

describe("persisted social pulse fallback", () => {
  beforeEach(() => {
    setting.findUnique.mockReset();
    setting.upsert.mockReset();
    delete process.env.INSTAGRAM_ACCESS_TOKEN;
    delete process.env.TIKTOK_ACCESS_TOKEN;
    delete process.env.LINKEDIN_ACCESS_TOKEN;
  });

  it("returns the three supported platforms and excludes X", async () => {
    setting.findUnique.mockResolvedValue(null);
    const accounts = await readStoredSocialMetrics();
    expect(accounts.map((account) => account.platform)).toEqual([
      "instagram",
      "tiktok",
      "linkedin",
    ]);
  });

  it("uses persisted values when provider credentials are unavailable", async () => {
    setting.findUnique.mockResolvedValue({
      value: JSON.stringify([
        { platform: "instagram", followers: 1200, likes: 4500 },
        { platform: "tiktok", followers: 800, likes: 9000 },
        { platform: "linkedin", followers: 42, likes: 77 },
      ]),
    });
    const snapshot = await getSocialMetricsSnapshot();
    expect(snapshot.accounts[0]).toMatchObject({
      platform: "instagram",
      followers: 1200,
      likes: 4500,
      available: true,
    });
  });

  it("stores normalized values in the database setting", async () => {
    setting.upsert.mockResolvedValue({});
    await writeStoredSocialMetrics([
      { platform: "instagram", followers: 10, likes: 20, available: true },
      { platform: "tiktok", followers: null, likes: null, available: false },
      { platform: "linkedin", followers: 30, likes: 40, available: true },
    ]);
    expect(setting.upsert).toHaveBeenCalledOnce();
    const call = setting.upsert.mock.calls[0][0];
    expect(JSON.parse(call.create.value)).toHaveLength(3);
    expect(call.where.key).toBe("studio:social-metrics");
  });
});
