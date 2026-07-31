/** A row of `FlzProject` as handed to the studio (dates stripped server-side). */
export interface FlzProjectData {
  id: string;
  title: string;
  tools: string;
  category: string;
  /** ISO string; the server strips Date objects before handing rows to the studio. */
  publishedAt?: string | null;
  gradient?: string | null;
  body?: string | null;
  featured: boolean;
  visible: boolean;
  sortOrder: number;
  linkUrl?: string | null;
  imageUrl?: string | null;
}

export const CATEGORIES = [
  "Characters",
  "Automotive",
  "Gameplay",
  "Assets",
  "Environments",
  "Shaders/VFX",
  "Web Dev",
] as const;

/** Card washes used by the public hub tiles — kept in sync with its palette. */
export const GRADIENT_PRESETS = [
  {
    label: "Warm sand",
    value:
      "radial-gradient(120% 130% at 24% 6%,rgba(216,195,166,.62),rgba(120,96,72,.12) 55%,transparent 76%)",
  },
  {
    label: "Sage green",
    value:
      "radial-gradient(120% 130% at 78% 6%,rgba(169,182,160,.58),rgba(95,107,82,.12) 55%,transparent 76%)",
  },
  {
    label: "Dust purple",
    value:
      "radial-gradient(120% 130% at 30% 82%,rgba(176,166,192,.55),rgba(95,86,112,.12) 55%,transparent 76%)",
  },
  {
    label: "Terracotta",
    value:
      "radial-gradient(120% 130% at 72% 24%,rgba(199,169,160,.58),rgba(122,90,80,.12) 55%,transparent 76%)",
  },
  {
    label: "Golden amber",
    value:
      "radial-gradient(120% 130% at 20% 28%,rgba(201,183,154,.58),rgba(138,122,85,.12) 55%,transparent 76%)",
  },
  {
    label: "Steel blue",
    value:
      "radial-gradient(120% 130% at 62% 72%,rgba(159,180,184,.55),rgba(86,108,112,.12) 55%,transparent 76%)",
  },
] as const;

export const ARTICLE_CATEGORIES = [
  { value: "CAR_DESIGN", label: "3D automotive" },
  { value: "GAMES", label: "Games" },
  { value: "BRICKWORKS", label: "Brickworks" },
  { value: "MEDIA", label: "Media" },
  { value: "OTHER", label: "Other" },
] as const;

export function articleCategoryLabel(value: string): string {
  return ARTICLE_CATEGORIES.find((c) => c.value === value)?.label ?? "Other";
}
