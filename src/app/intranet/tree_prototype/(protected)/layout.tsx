import { redirect } from "next/navigation";
import { getIntranetGateState } from "@/lib/intranet";
import { TREE_PROTOTYPE_BASE_PATH, TREE_PROTOTYPE_INTRANET_MODULE } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function TreePrototypeIntranetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await getIntranetGateState(TREE_PROTOTYPE_INTRANET_MODULE);

  if (gate.status !== "allowed") {
    redirect(`${TREE_PROTOTYPE_BASE_PATH}/request`);
  }

  return (
    <div className="ap3d-shell min-h-screen selection:bg-white/20">
      {children}
    </div>
  );
}
