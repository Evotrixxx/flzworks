import { redirect } from "next/navigation";
import { autopiacPath } from "@/lib/routes";

export default function LegacySellRedirect() {
  redirect(autopiacPath("/sell"));
}
