import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FlzAdminDashboard } from "@/components/flz-admin-dashboard";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

export default async function FlzAdminPage() {
  const user = await getCurrentUser();

  // Safety Net Rule 1: Require User Session
  if (!user) {
    const nextPath = encodeURIComponent("/studio/admin");
    redirect(`/login?redirect=${nextPath}`);
  }

  // Safety Net Rule 2: Require ADMIN Role
  if (user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#100e0c] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl p-8 bg-[#1c1a17] border border-rose-500/30 text-center shadow-2xl space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight">
              Access Denied
            </h1>
            <p className="text-sm text-white/60 mt-2 leading-relaxed">
              Admin authorization is required to access the FLZ.works Content Management Editor Dashboard.
            </p>
            <p className="text-xs text-white/40 font-mono mt-2">
              Current account: <span className="text-white font-semibold">{user.email}</span>
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <a
              href="/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition"
            >
              <ArrowLeft className="h-4 w-4" /> Return to FLZ Landing Page
            </a>

            <div className="flex justify-center pt-2">
              <LogoutButton label="Log out & Sign in as Admin" compact />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fetch initial data
  const [projectsData, settingsData] = await Promise.all([
    prisma.flzProject.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.flzSetting.findMany(),
  ]);

  const initialProjects = projectsData.map((p) => ({
    ...p,
    createdAt: undefined,
    updatedAt: undefined,
  }));

  const initialSettings: Record<string, string> = {};
  for (const s of settingsData) {
    initialSettings[s.key] = s.value;
  }

  return (
    <FlzAdminDashboard
      initialProjects={initialProjects}
      initialSettings={initialSettings}
      userEmail={user.email}
    />
  );
}
