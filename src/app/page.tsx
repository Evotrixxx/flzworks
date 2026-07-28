import type { Metadata } from "next";
import PortfolioHub from "@/app/uidesign/portfolio-hub/page";

export const metadata: Metadata = {
  title: "FLZ — Bence Flosz",
  description:
    "Games and 3D, built in public. Indie Game Developer & Studio Founder based in Budapest.",
  openGraph: {
    title: "FLZ — Bence Flosz",
    description: "Games and 3D, built in public. Indie Game Developer & Studio Founder.",
    url: "https://flz.works",
    siteName: "FLZ Works",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "FLZ — Bence Flosz",
    description: "Games and 3D, built in public.",
  },
};

export default function Home() {
  return <PortfolioHub />;
}
