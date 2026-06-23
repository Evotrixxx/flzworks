import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert, OctagonX } from "lucide-react";
import { IntranetAccessRequestForm } from "@/components/intranet-access-request-form";
import { getIntranetGateState } from "@/lib/intranet";
import { AUTOPIAC_BASE_PATH } from "@/lib/routes";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Request Access | AutoPiac Intranet",
};

export default async function AutoPiacAccessRequestPage() {
  const gate = await getIntranetGateState();

  if (gate.status === "allowed") {
    redirect(AUTOPIAC_BASE_PATH);
  }

  return (
    <div className="ap3d-shell min-h-screen">
      {/* Animated background blobs */}
      <div className="showroom-shapes" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>

      <main className="relative z-10 grid min-h-screen place-items-center px-4 py-12">
        <section className="w-full max-w-lg space-y-6">
          {/* Back to portfolio */}
          <Link
            href="/"
            className="inline-block text-xs font-black uppercase tracking-[0.22em] text-slate-400 transition hover:text-white"
          >
            ← FLZ Works
          </Link>

          {/* Gate card */}
          <div className="glass-surface rounded-2xl p-7">
            {/* Header row */}
            <div className="mb-7 flex items-start gap-4">
              <span className="glass-chip flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-[var(--accent-aqua)]">
                <ShieldAlert className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="mb-0.5 text-[0.7rem] font-black uppercase tracking-widest text-slate-400">
                  Intranet Access
                </p>
                <h1 className="text-2xl font-black leading-tight text-white">
                  AutoPiac Showroom
                </h1>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                  Request one-time access. An approval email is sent to the host — granted access is scoped to this module only.
                </p>
              </div>
            </div>

            {/* Blocked state */}
            {gate.status === "blocked" ? (
              <div className="flex items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-4 backdrop-blur-sm">
                <OctagonX className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" aria-hidden="true" />
                <p className="text-sm font-semibold leading-relaxed text-rose-200">
                  Access from this IP is blocked until{" "}
                  <span className="font-black">{gate.expiresAt.toLocaleString("en-US")}</span>.
                </p>
              </div>
            ) : (
              <IntranetAccessRequestForm />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
