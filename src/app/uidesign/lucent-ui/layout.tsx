import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lucent UI",
  description: "A premium liquid-glass design system featuring WebGL refraction shaders. Every component warps and magnifies the background grid as your cursor passes through it.",
};

export default function LucentUILayout({ children }: { children: React.ReactNode }) {
  return children;
}
