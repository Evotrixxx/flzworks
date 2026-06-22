import { redirect } from "next/navigation";
import { getIntranetGateState } from "@/lib/intranet";
import { AUTOPIAC_BASE_PATH } from "@/lib/routes";

export const dynamic = "force-dynamic";

export default async function AutoPiacProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await getIntranetGateState();

  if (gate.status !== "allowed") {
    redirect(`${AUTOPIAC_BASE_PATH}/request`);
  }

  return (
    <div className="ap3d-shell min-h-screen">
      {children}
    </div>
  );
}
