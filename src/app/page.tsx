import type { Metadata } from "next";
import { PortfolioOnepager } from "@/components/portfolio-onepager";
import { getInstagramMedia } from "@/lib/instagram";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";

export const metadata: Metadata = {
  title: "FLZ | Portfolio",
  description: "FLZ portfolio for game development, 3D modeling, automotive design, web development, and digital art.",
};

export default async function Home() {
  const [instagramMedia, allArticles] = await Promise.all([
    getInstagramMedia(),
    syncPortfolioArticles(),
  ]);

  // Only pass visible articles to the public landing page
  const visibleArticles = allArticles.filter((article) => article.visible);

  return <PortfolioOnepager instagramMedia={instagramMedia} articles={visibleArticles} />;
}
