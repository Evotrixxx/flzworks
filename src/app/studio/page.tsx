import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPortfolioArticles, PortfolioArticleWithImages } from "@/lib/portfolio-sync";
import { readSocialConfig, DEFAULT_SOCIAL, SocialEntry } from "@/lib/social-config";
import { StudioEditor } from "@/components/studio-editor";
import { checkIsAdminEmail } from "@/lib/flz-security";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FLZ | Studio Content Management Editor",
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
      <div className="bp-root bp-studio">
        <div className="bp-studio-denied">
          <div className="bp-studio-denied-tag bp-accent">■ ACCESS RESTRICTED</div>
          <h1 className="bp-studio-denied-title">ADMIN CLEARANCE REQUIRED</h1>
          <p className="bp-studio-denied-body">
            The studio editor is limited to administrator accounts. You are signed in as{" "}
            <strong>{user.email}</strong>.
          </p>
          <a href="/" className="bp-btn">← BACK TO SITE</a>
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

  let projectsData: any[] = [];
  try {
    projectsData = await prisma.flzProject.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Failed to query flzProject in StudioPage:", err);
  }

  let settingsData: any[] = [];
  try {
    settingsData = await prisma.flzSetting.findMany();
  } catch (err) {
    console.error("Failed to query flzSetting in StudioPage:", err);
  }

  const flzProjects = (projectsData || []).map((p) => ({
    ...p,
    createdAt: undefined,
    updatedAt: undefined,
  }));

  const flzSettings: Record<string, string> = {};
  for (const s of settingsData || []) {
    flzSettings[s.key] = s.value;
  }

  return (
    <StudioEditor
      articles={articles}
      social={social}
      flzProjects={flzProjects}
      flzSettings={flzSettings}
      userEmail={user.email}
    />
  );
}
