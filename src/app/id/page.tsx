import type { Metadata } from "next";
import { PortfolioOnepager } from "@/components/portfolio-onepager";
import { getInstagramMedia } from "@/lib/instagram";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FLZ | Identity",
  description: "Bence Flosz virtual namecard, contact details, social links, and interactive 3D identity card.",
  alternates: {
    canonical: "/id",
  },
  openGraph: {
    title: "FLZ | Identity — Bence Flosz",
    description: "Bence Flosz virtual namecard, contact details, and interactive 3D identity card.",
    url: "https://flz.works/id",
    siteName: "FLZ Works",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FLZ | Identity — Bence Flosz",
    description: "Bence Flosz virtual namecard, contact details, and interactive 3D identity card.",
  },
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
