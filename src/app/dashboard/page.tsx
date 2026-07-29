import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { checkIsAdminEmail } from "@/lib/flz-security";
import { autopiacPath } from "@/lib/routes";

export default async function DashboardRedirect() {
  const user = await getCurrentUser();
  if (user && (user.role === "ADMIN" || checkIsAdminEmail(user.email))) {
    redirect("/studio");
  }
  redirect(autopiacPath("/dashboard"));
}
