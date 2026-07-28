import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio Hub — Flz.works",
  description: "Liquid-glass game portfolio console. One glass slab over a warm interior. Drop your own room photo behind it.",
};

export default function PortfolioHubLayout({ children }: { children: React.ReactNode }) {
  return children;
}
