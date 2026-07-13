import type { Metadata } from "next";
import { PortfolioOnepager } from "@/components/portfolio-onepager";
import { getInstagramMedia } from "@/lib/instagram";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FLZ | Identity",
  description: "Bence Flosz virtual namecard and contact details.",
};

export default async function IDPage() {
  const [instagramMedia, allArticles] = await Promise.all([
    getInstagramMedia(),
    syncPortfolioArticles(),
  ]);

  const visibleArticles = allArticles.filter((article) => article.visible);

  return (
    <PortfolioOnepager
      instagramMedia={instagramMedia}
      articles={visibleArticles}
      forceNamecardOpen={true}
    />
  );
}
