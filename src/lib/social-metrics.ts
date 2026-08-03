import "server-only";

import type { SocialPlatform } from "@/lib/social-config";

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

const PLATFORMS: SocialPlatform[] = ["instagram", "tiktok", "x", "linkedin"];

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

async function xMetrics(): Promise<SocialMetric> {
  const platform = "x" as const;
  const token = process.env.X_BEARER_TOKEN;
  const username = process.env.X_USERNAME;
  if (!token || !username) return unavailable(platform);

  const headers = { Authorization: `Bearer ${token}` };
  const userUrl = new URL(`https://api.x.com/2/users/by/username/${encodeURIComponent(username)}`);
  userUrl.searchParams.set("user.fields", "public_metrics");

  try {
    const profile = await fetchJson(userUrl, headers) as {
      data?: { id?: string; public_metrics?: { followers_count?: number } };
    };
    const userId = profile.data?.id;
    if (!userId) return unavailable(platform);

    const postsUrl = new URL(`https://api.x.com/2/users/${userId}/tweets`);
    postsUrl.searchParams.set("max_results", "100");
    postsUrl.searchParams.set("exclude", "replies,retweets");
    postsUrl.searchParams.set("tweet.fields", "public_metrics");
    const posts = await fetchJson(postsUrl, headers) as {
      data?: Array<{ public_metrics?: { like_count?: number } }>;
    };

    const followers = numeric(profile.data?.public_metrics?.followers_count);
    const likes = Array.isArray(posts.data)
      ? posts.data.reduce((sum, post) => sum + (numeric(post.public_metrics?.like_count) ?? 0), 0)
      : null;
    return { platform, followers, likes, available: followers !== null || likes !== null };
  } catch (error) {
    console.warn("X metrics fetch failed.", error);
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
  const accounts = await Promise.all([
    instagramMetrics(),
    tiktokMetrics(),
    xMetrics(),
    linkedinMetrics(),
  ]);
  return {
    accounts,
    updatedAt: accounts.some((account) => account.available) ? new Date().toISOString() : null,
  };
}
