import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPortfolioArticles, PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { readSocialConfig, DEFAULT_SOCIAL, SocialEntry } from "@/lib/social-config";
import { StudioEditor } from "@/components/studio-editor";
import type { FlzProjectData } from "@/components/studio/types";
import { checkIsAdminEmail } from "@/lib/flz-security";
import { emptyTelemetrySnapshot, getTelemetrySnapshot } from "@/lib/telemetry";
import { emptySocialMetricsSnapshot, getSocialMetricsSnapshot } from "@/lib/social-metrics";
import s from "@/components/studio/studio.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FLZ | Studio",
  robots: { index: false, follow: false },
};

export default async function StudioPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/studio");
  }

  const isAdmin = user.role === "ADMIN" || checkIsAdminEmail(user.email);

  if (!isAdmin) {
    return (
      <div className={s.root}>
        <div className={s.orbA} />
        <div className={s.denied}>
          <div className={s.deniedCard}>
            <span className={s.deniedIcon}>
              <ShieldAlert size={22} />
            </span>
            <h1 className={s.deniedTitle}>Admin access only</h1>
            <p className={s.deniedBody}>
              The studio editor is limited to administrator accounts. You are signed in as{" "}
              <span className={s.deniedMail}>{user.email}</span>.
            </p>
            <Link href="/" className={s.btn}>
              Back to flz.works
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safely auto-promote in DB if needed
  if (user.role !== "ADMIN") {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
    } catch (err) {
      console.warn("Could not update user role to ADMIN in DB:", err);
    }
  }

  // Safe data fetching with fallback arrays
  let articles: PortfolioArticleWithImages[] = [];
  try {
    articles = await syncPortfolioArticles();
  } catch (err) {
    console.error("Failed to sync portfolio articles in StudioPage:", err);
  }

  let social: SocialEntry[] = DEFAULT_SOCIAL;
  try {
    social = await readSocialConfig();
  } catch (err) {
    console.error("Failed to read social config in StudioPage:", err);
  }

  let projectsData: Awaited<ReturnType<typeof prisma.flzProject.findMany>> = [];
  try {
    projectsData = await prisma.flzProject.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Failed to query flzProject in StudioPage:", err);
  }

  let settingsData: Awaited<ReturnType<typeof prisma.flzSetting.findMany>> = [];
  try {
    settingsData = await prisma.flzSetting.findMany();
  } catch (err) {
    console.error("Failed to query flzSetting in StudioPage:", err);
  }

  // Only hand the client the fields the editor works with — timestamps stay server-side.
  const flzProjects: FlzProjectData[] = projectsData.map((p) => ({
    id: p.id,
    title: p.title,
    tools: p.tools,
    category: p.category,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    gradient: p.gradient,
    body: p.body,
    featured: p.featured,
    visible: p.visible,
    sortOrder: p.sortOrder,
    linkUrl: p.linkUrl,
    imageUrl: p.imageUrl,
  }));

  const flzSettings: Record<string, string> = {};
  for (const setting of settingsData) {
    flzSettings[setting.key] = setting.value;
  }

  let telemetry = emptyTelemetrySnapshot();
  try {
    telemetry = await getTelemetrySnapshot();
  } catch (err) {
    console.error("Failed to query telemetry in StudioPage:", err);
  }

  let socialMetrics = emptySocialMetricsSnapshot();
  try {
    socialMetrics = await getSocialMetricsSnapshot();
  } catch (err) {
    console.error("Failed to query social metrics in StudioPage:", err);
  }

  return (
    <StudioEditor
      articles={articles}
      social={social}
      flzProjects={flzProjects}
      flzSettings={flzSettings}
      userEmail={user.email}
      telemetry={telemetry}
      socialMetrics={socialMetrics}
    />
  );
}
