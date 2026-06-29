import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dynamic Island HUD",
  description: "A fluid, physics-based notification space recreating the iOS Dynamic Island alerts and morphing states.",
};

export default function DynamicIslandLayout({ children }: { children: React.ReactNode }) {
  return children;
}
