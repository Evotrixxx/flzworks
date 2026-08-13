import "server-only";

import { prisma } from "@/lib/prisma";

// Social "Transmissions" config for the Blueprint landing page. Persisted as a
// namespaced FlzSetting row and edited from the internal
// Studio editor. Each entry points a platform card at a latest-post link + a
// preview image; empty entries fall back to the drafting placeholder.

export type SocialPlatform = "instagram" | "tiktok" | "linkedin";

export interface SocialEntry {
  platform: SocialPlatform;
  /** Sheet-style label shown above the image, e.g. "X — @FLZWORKS". */
  label: string;
  /** Link the card opens (the latest post). */
  postUrl: string;
  /** Image shown in the card (the latest post's image). */
  imageUrl: string;
}

export const DEFAULT_SOCIAL: SocialEntry[] = [
  { platform: "instagram", label: "IG — @FLZWORKS", postUrl: "", imageUrl: "" },
  { platform: "tiktok", label: "TIKTOK", postUrl: "", imageUrl: "" },
  { platform: "linkedin", label: "LINKEDIN", postUrl: "", imageUrl: "" },
];

export const SOCIAL_CONFIG_KEY = "studio:social-config";

/**
 * Read the saved config, always returning exactly the supported platforms in
 * a stable order (merging any saved values over the defaults).
 */
export async function readSocialConfig(): Promise<SocialEntry[]> {
  let saved: unknown = null;
  try {
    const setting = await prisma.flzSetting.findUnique({
      where: { key: SOCIAL_CONFIG_KEY },
      select: { value: true },
    });
    saved = setting ? JSON.parse(setting.value) : null;
  } catch {
    return DEFAULT_SOCIAL;
  }

  const savedList = Array.isArray(saved) ? (saved as Partial<SocialEntry>[]) : [];
  return DEFAULT_SOCIAL.map((base) => {
    const match = savedList.find((entry) => entry?.platform === base.platform);
    return match
      ? {
          platform: base.platform,
          label: typeof match.label === "string" ? match.label : base.label,
          postUrl: typeof match.postUrl === "string" ? match.postUrl : "",
          imageUrl: typeof match.imageUrl === "string" ? match.imageUrl : "",
        }
      : base;
  });
}

export async function writeSocialConfig(entries: SocialEntry[]): Promise<void> {
  await prisma.flzSetting.upsert({
    where: { key: SOCIAL_CONFIG_KEY },
    create: { key: SOCIAL_CONFIG_KEY, value: JSON.stringify(entries) },
    update: { value: JSON.stringify(entries) },
  });
}
