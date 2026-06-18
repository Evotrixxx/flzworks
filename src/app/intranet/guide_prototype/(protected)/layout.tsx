import { redirect } from "next/navigation";
import { getIntranetGateState } from "@/lib/intranet";
import { GUIDE_PROTOTYPE_BASE_PATH, GUIDE_PROTOTYPE_INTRANET_MODULE } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function GuidePrototypeProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await getIntranetGateState(GUIDE_PROTOTYPE_INTRANET_MODULE);

  if (gate.status !== "allowed") {
    redirect(`${GUIDE_PROTOTYPE_BASE_PATH}/request`);
  }

  return children;
}
