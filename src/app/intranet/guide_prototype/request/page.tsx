import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { IntranetAccessRequestForm } from "@/components/intranet-access-request-form";
import { getIntranetGateState } from "@/lib/intranet";
import { GUIDE_PROTOTYPE_BASE_PATH, GUIDE_PROTOTYPE_INTRANET_MODULE } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function GuidePrototypeAccessRequestPage() {
  const gate = await getIntranetGateState(GUIDE_PROTOTYPE_INTRANET_MODULE);

  if (gate.status === "allowed") {
    redirect(GUIDE_PROTOTYPE_BASE_PATH);
  }

  if (gate.status === "approved-unclaimed") {
    redirect(`${GUIDE_PROTOTYPE_BASE_PATH}/access`);
  }

  return (
    <main className="portfolio-shell grid min-h-screen place-items-center overflow-hidden bg-black px-4 py-10 text-zinc-50">
      <section className="relative z-10 grid w-full max-w-xl gap-5">
        <Link href="/" className="text-sm font-black tracking-[0.24em] text-zinc-400 transition hover:text-white">
          FLZ
        </Link>
        <div className="portfolio-glass-panel rounded-lg p-6">
          <div className="mb-6 flex items-start gap-4">
            <span className="portfolio-icon-glass flex h-12 w-12 items-center justify-center rounded-lg">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-3xl font-black text-white">Guide Prototype Access</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-zinc-400">
                Request one-time access. The host receives an approval email, and approved access is scoped to
                this intranet module.
              </p>
            </div>
          </div>

          {gate.status === "blocked" ? (
            <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-4 text-sm font-semibold leading-6 text-rose-100">
              Access from this IP is blocked until {gate.expiresAt.toLocaleString("en-US")}.
            </p>
          ) : (
            <IntranetAccessRequestForm module={GUIDE_PROTOTYPE_INTRANET_MODULE} />
          )}
        </div>
      </section>
    </main>
  );
}
