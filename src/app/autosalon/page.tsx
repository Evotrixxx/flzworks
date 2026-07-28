import type { Metadata } from "next";
import { PortfolioBlueprint } from "@/components/portfolio-blueprint";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";
import { readSocialConfig, type SocialEntry } from "@/lib/social-config";
import { getInstagramMedia } from "@/lib/instagram";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FLZ | Portfolio",
  description: "FLZ portfolio for game development, 3D modeling, automotive design, web development, and digital art.",
};

export default async function AutosalonPage() {
  const [allArticles, social, instagramMedia] = await Promise.all([
    syncPortfolioArticles(),
    readSocialConfig(),
    getInstagramMedia(1),
  ]);

  // Only surface visible projects on the public landing page.
  const visibleArticles = allArticles.filter((article) => article.visible);

  // If the Instagram card has no explicit image set in the Studio editor, fall
  // back to the latest post from the connected Instagram feed (when available).
  const latestIg = instagramMedia[0];
  const transmissions: SocialEntry[] = social.map((entry) => {
    if (entry.platform === "instagram" && !entry.imageUrl && latestIg) {
      return {
        ...entry,
        imageUrl: latestIg.thumbnail_url || latestIg.media_url || "",
        postUrl: entry.postUrl || latestIg.permalink,
      };
    }
    return entry;
  });

  return <PortfolioBlueprint articles={visibleArticles} transmissions={transmissions} />;
}
