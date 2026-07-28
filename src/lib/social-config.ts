import "server-only";

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

// Social "Transmissions" config for the Blueprint landing page. Persisted as a
// small JSON file (no DB migration required) and edited from the internal
// Studio editor. Each entry points a platform card at a latest-post link + a
// preview image; empty entries fall back to the drafting placeholder.

export type SocialPlatform = "x" | "instagram" | "tiktok" | "linkedin";

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
  { platform: "x", label: "X — @FLZWORKS", postUrl: "", imageUrl: "" },
  { platform: "instagram", label: "IG — @FLZWORKS", postUrl: "", imageUrl: "" },
  { platform: "tiktok", label: "TIKTOK", postUrl: "", imageUrl: "" },
  { platform: "linkedin", label: "LINKEDIN", postUrl: "", imageUrl: "" },
];

const CONFIG_PATH = path.join(process.cwd(), "data", "social-config.json");

/**
 * Read the saved config, always returning exactly the four known platforms in
 * a stable order (merging any saved values over the defaults).
 */
export async function readSocialConfig(): Promise<SocialEntry[]> {
  let saved: unknown = null;
  try {
    saved = JSON.parse(await readFile(CONFIG_PATH, "utf8"));
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
  await mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(entries, null, 2), "utf8");
}
