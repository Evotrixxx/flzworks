import { redirect } from "next/navigation";
import { getIntranetGateState } from "@/lib/intranet";
import { IntranetAccessRequestForm } from "@/components/intranet-access-request-form";
import { TREE_PROTOTYPE_BASE_PATH, TREE_PROTOTYPE_INTRANET_MODULE } from "@/lib/routes";

export const metadata = {
  title: "Request Access | Tree Prototype",
};

export default async function TreePrototypeRequestPage() {
  const gate = await getIntranetGateState(TREE_PROTOTYPE_INTRANET_MODULE);

  if (gate.status === "allowed") {
    redirect(TREE_PROTOTYPE_BASE_PATH);
  }

  return (
    <main className="portfolio-shell grid min-h-screen place-items-center overflow-hidden bg-black px-4 py-10 text-zinc-50">
      <section className="relative z-10 grid w-full max-w-xl gap-5">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">Tree Prototype Access</h1>
          <p className="text-sm text-zinc-400">
            Request secure access to the Call Center Mind Map module.
          </p>
        </header>

        <div className="portfolio-glass-panel rounded-lg p-6 sm:p-8">
          <IntranetAccessRequestForm module={TREE_PROTOTYPE_INTRANET_MODULE} />
        </div>
      </section>
    </main>
  );
}
