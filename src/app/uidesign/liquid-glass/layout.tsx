import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liquid Glass Player",
  description: "A cinematic music player UI built on layered backdrop-filter blur and frosted glass panels. Rich colour bleeds from album art through every control surface.",
};

export default function LiquidGlassLayout({ children }: { children: React.ReactNode }) {
  return children;
}
