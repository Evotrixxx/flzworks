import { redirect } from "next/navigation";
import { getIntranetGateState } from "@/lib/intranet";
import { TREE_PROTOTYPE_BASE_PATH, TREE_PROTOTYPE_INTRANET_MODULE } from "@/lib/routes";

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
    <div className="flex min-h-screen flex-col bg-black text-white selection:bg-white/30">
      {children}
    </div>
  );
}
