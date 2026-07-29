import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncPortfolioArticles } from "@/lib/portfolio-sync";
import { readSocialConfig } from "@/lib/social-config";
import { StudioEditor } from "@/components/studio-editor";

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

  if (user.role !== "ADMIN") {
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

  const [articles, social, projectsData, settingsData] = await Promise.all([
    syncPortfolioArticles(),
    readSocialConfig(),
    prisma.flzProject.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.flzSetting.findMany(),
  ]);

  const flzProjects = projectsData.map((p) => ({
    ...p,
    createdAt: undefined,
    updatedAt: undefined,
  }));

  const flzSettings: Record<string, string> = {};
  for (const s of settingsData) {
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
