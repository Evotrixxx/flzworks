import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "iOS Widget Space",
  description: "A modular Home Screen dashboard featuring interactive iOS-style weather, fitness rings, calendar events, and battery level widgets.",
};

export default function WidgetSpaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
