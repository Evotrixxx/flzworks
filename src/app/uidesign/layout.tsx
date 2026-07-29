import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s — flz.works/uidesign",
    default: "UI Design Showcase — flz.works",
  },
  description:
    "A curated gallery of premium UI/UX design systems by flz.works — featuring glassmorphism, WebGL refraction, and cutting-edge interaction patterns.",
};

export default function UiDesignLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="uidesign-root font-sans" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
