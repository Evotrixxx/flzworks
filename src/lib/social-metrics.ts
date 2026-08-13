import "server-only";

import type { SocialPlatform } from "@/lib/social-config";
import { prisma } from "@/lib/prisma";

export interface SocialMetric {
  platform: SocialPlatform;
  followers: number | null;
  likes: number | null;
  available: boolean;
}

export interface SocialMetricsSnapshot {
  accounts: SocialMetric[];
  updatedAt: string | null;
}

const PLATFORMS: SocialPlatform[] = ["instagram", "tiktok", "linkedin"];
const SOCIAL_METRICS_KEY = "studio:social-metrics";

function unavailable(platform: SocialPlatform): SocialMetric {
  return { platform, followers: null, likes: null, available: false };
}

export function emptySocialMetricsSnapshot(): SocialMetricsSnapshot {
  return { accounts: PLATFORMS.map(unavailable), updatedAt: null };
}

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function fetchJson(url: URL, headers?: HeadersInit): Promise<unknown> {
  const response = await fetch(url, {
    cache: "no-store",
    headers,
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Social API request failed with ${response.status}`);
  return response.json();
}

async function instagramMetrics(): Promise<SocialMetric> {
  const platform = "instagram" as const;
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID ?? "me";
  if (!token) return unavailable(platform);

  const profileUrl = new URL(`https://graph.instagram.com/${userId}`);
  profileUrl.searchParams.set("fields", "followers_count");
  profileUrl.searchParams.set("access_token", token);

  const mediaUrl = new URL(`https://graph.instagram.com/${userId}/media`);
  mediaUrl.searchParams.set("fields", "like_count");
  mediaUrl.searchParams.set("limit", "100");
  mediaUrl.searchParams.set("access_token", token);

  try {
    const [profile, media] = await Promise.all([
      fetchJson(profileUrl) as Promise<{ followers_count?: number }>,
      fetchJson(mediaUrl) as Promise<{ data?: Array<{ like_count?: number }> }>,
    ]);
    const followers = numeric(profile.followers_count);
    const likes = Array.isArray(media.data)
      ? media.data.reduce((sum, item) => sum + (numeric(item.like_count) ?? 0), 0)
      : null;
    return { platform, followers, likes, available: followers !== null || likes !== null };
  } catch (error) {
    console.warn("Instagram metrics fetch failed.", error);
    return unavailable(platform);
  }
}

async function tiktokMetrics(): Promise<SocialMetric> {
  const platform = "tiktok" as const;
  const token = process.env.TIKTOK_ACCESS_TOKEN;
  if (!token) return unavailable(platform);

  const url = new URL("https://open.tiktokapis.com/v2/user/info/");
  url.searchParams.set("fields", "follower_count,likes_count");

  try {
    const payload = await fetchJson(url, { Authorization: `Bearer ${token}` }) as {
      data?: { user?: { follower_count?: number; likes_count?: number } };
    };
    const followers = numeric(payload.data?.user?.follower_count);
    const likes = numeric(payload.data?.user?.likes_count);
    return { platform, followers, likes, available: followers !== null || likes !== null };
  } catch (error) {
    console.warn("TikTok metrics fetch failed.", error);
    return unavailable(platform);
  }
}

async function linkedinMetrics(): Promise<SocialMetric> {
  const platform = "linkedin" as const;
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const organizationId = process.env.LINKEDIN_ORGANIZATION_ID;
  if (!token || !organizationId) return unavailable(platform);

  const urn = `urn:li:organization:${organizationId}`;
  const version = process.env.LINKEDIN_API_VERSION ?? "202606";
  const headers = {
    Authorization: `Bearer ${token}`,
    "LinkedIn-Version": version,
    "X-Restli-Protocol-Version": "2.0.0",
  };

  const followersUrl = new URL(`https://api.linkedin.com/rest/networkSizes/${urn}`);
  followersUrl.searchParams.set("edgeType", "COMPANY_FOLLOWED_BY_MEMBER");
  const likesUrl = new URL("https://api.linkedin.com/rest/organizationalEntityShareStatistics");
  likesUrl.searchParams.set("q", "organizationalEntity");
  likesUrl.searchParams.set("organizationalEntity", urn);

  try {
    const [followersPayload, likesPayload] = await Promise.all([
      fetchJson(followersUrl, headers) as Promise<{ firstDegreeSize?: number }>,
      fetchJson(likesUrl, headers) as Promise<{
        elements?: Array<{ totalShareStatistics?: { likeCount?: number } }>;
      }>,
    ]);
    const followers = numeric(followersPayload.firstDegreeSize);
    const likes = numeric(likesPayload.elements?.[0]?.totalShareStatistics?.likeCount);
    return { platform, followers, likes, available: followers !== null || likes !== null };
  } catch (error) {
    console.warn("LinkedIn metrics fetch failed.", error);
    return unavailable(platform);
  }
}

export async function getSocialMetricsSnapshot(): Promise<SocialMetricsSnapshot> {
  const [liveAccounts, stored] = await Promise.all([
    Promise.all([
    instagramMetrics(),
    tiktokMetrics(),
    linkedinMetrics(),
    ]),
    readStoredSocialMetrics(),
  ]);
  const accounts = liveAccounts.map((live) => {
    if (live.available) return live;
    return stored.find((account) => account.platform === live.platform) ?? live;
  });
  return {
    accounts,
    updatedAt: accounts.some((account) => account.available) ? new Date().toISOString() : null,
  };
}

export async function readStoredSocialMetrics(): Promise<SocialMetric[]> {
  try {
    const setting = await prisma.flzSetting.findUnique({ where: { key: SOCIAL_METRICS_KEY } });
    const parsed = setting ? JSON.parse(setting.value) as Partial<SocialMetric>[] : [];
    return PLATFORMS.map((platform) => {
      const match = Array.isArray(parsed)
        ? parsed.find((account) => account.platform === platform)
        : undefined;
      const followers = numeric(match?.followers);
      const likes = numeric(match?.likes);
      return { platform, followers, likes, available: followers !== null || likes !== null };
    });
  } catch {
    return PLATFORMS.map(unavailable);
  }
}

export async function writeStoredSocialMetrics(accounts: SocialMetric[]): Promise<void> {
  const normalized = PLATFORMS.map((platform) => {
    const match = accounts.find((account) => account.platform === platform);
    const followers = numeric(match?.followers);
    const likes = numeric(match?.likes);
    return { platform, followers, likes, available: followers !== null || likes !== null };
  });
  await prisma.flzSetting.upsert({
    where: { key: SOCIAL_METRICS_KEY },
    create: { key: SOCIAL_METRICS_KEY, value: JSON.stringify(normalized) },
    update: { value: JSON.stringify(normalized) },
  });
}
