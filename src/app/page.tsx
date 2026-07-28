import type { Metadata } from "next";
import { LucidLanding } from "@/components/lucid-landing";
import { getInstagramMedia } from "@/lib/instagram";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FLZ — Bence Flosz",
  description:
    "Gazdaságinformatikus (BGE), Indie Game Developer & Studio Founder, Backend Developer based in Budapest. Building a 4-player co-op liminal game with Godot + Blender.",
  openGraph: {
    title: "FLZ — Bence Flosz",
    description:
      "Gazdaságinformatikus (BGE), Indie Game Developer & Studio Founder, Backend Developer.",
    url: "https://flz.works",
    siteName: "FLZ Works",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FLZ — Bence Flosz",
    description: "Gazdaságinformatikus (BGE) · Indie Game Developer & Studio Founder · Backend Developer",
  },
};

export default async function Home() {
  const [instagramMedia, allArticles] = await Promise.all([
    getInstagramMedia(),
    syncPortfolioArticles(),
  ]);

  const visibleArticles = allArticles.filter((article) => article.visible);

  return (
    <LucidLanding instagramMedia={instagramMedia} articles={visibleArticles} />
  );
}
