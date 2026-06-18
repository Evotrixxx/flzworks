import { redirect } from "next/navigation";
import { autopiacPath } from "@/lib/routes";

export default function LegacyDashboardRedirect() {
  redirect(autopiacPath("/dashboard"));
}
