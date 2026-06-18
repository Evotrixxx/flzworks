import "server-only";

export type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp?: string;
};

type InstagramMediaResponse = {
  data?: InstagramMediaItem[];
};

export async function getInstagramMedia(limit = 6): Promise<InstagramMediaItem[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID ?? "me";

  if (!token) {
    return [];
  }

  const fields = "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
  const url = new URL(`https://graph.instagram.com/${userId}/media`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 30 },
    });

    if (!response.ok) {
      console.warn("Instagram media fetch failed.", response.status);
      return [];
    }

    const payload = (await response.json()) as InstagramMediaResponse;
    return payload.data ?? [];
  } catch (error) {
    console.warn("Instagram media fetch failed.", error);
    return [];
  }
}
