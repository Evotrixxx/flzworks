import type { Metadata } from "next";
import { PortfolioOnepager } from "@/components/portfolio-onepager";
import { getInstagramMedia } from "@/lib/instagram";

export const metadata: Metadata = {
  title: "FLZ | Portfolio",
  description: "FLZ portfolio for game development, 3D modeling, automotive design, web development, and digital art.",
};

export default async function Home() {
  const instagramMedia = await getInstagramMedia();

  return <PortfolioOnepager instagramMedia={instagramMedia} />;
}
