import type { Metadata } from "next";
import { PortfolioOnepager } from "@/components/portfolio-onepager";
import { getInstagramMedia } from "@/lib/instagram";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Autosalon — 3D & Web Portfolio",
  description: "FLZ portfolio for game development, 3D environment & world building, web development, and digital art.",
  alternates: {
    canonical: "/autosalon",
  },
  openGraph: {
    title: "Autosalon — 3D & Web Portfolio",
    description: "FLZ portfolio for game development, 3D environment & world building, web development, and digital art.",
    url: "https://flz.works/autosalon",
    siteName: "FLZ Works",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Autosalon — 3D & Web Portfolio",
    description: "FLZ portfolio for game development, 3D environment & world building, web development, and digital art.",
  },
};

export default async function AutosalonPage() {
  const [instagramMedia, allArticles] = await Promise.all([
    getInstagramMedia(),
    syncPortfolioArticles(),
  ]);

  // Only pass visible articles to the public landing page
  const visibleArticles = allArticles.filter((article) => article.visible);

  return <PortfolioOnepager instagramMedia={instagramMedia} articles={visibleArticles} />;
}
