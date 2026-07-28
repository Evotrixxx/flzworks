import type { Metadata } from "next";
import { LucidLanding } from "@/components/lucid-landing";
import { getInstagramMedia } from "@/lib/instagram";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FLZ — Bence Flosz",
  description:
    "Indie Game Developer, 3D Artist & Backend Engineer based in Budapest. Building a 4-player co-op liminal/dreamcore game with Godot + Blender.",
  openGraph: {
    title: "FLZ — Bence Flosz",
    description:
      "Indie Game Developer, 3D Artist & Backend Engineer. Building liminal dreamcore games.",
    url: "https://flz.works",
    siteName: "FLZ Works",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FLZ — Bence Flosz",
    description: "Indie Game Developer · 3D Artist · Backend Engineer · Budapest",
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
