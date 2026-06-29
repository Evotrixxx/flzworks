import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "iOS Control Center",
  description: "Tactile Control Center dashboard featuring wide vertical sliders, network grids, and media controls.",
};

export default function ControlCenterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
