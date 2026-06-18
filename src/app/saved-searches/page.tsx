import { redirect } from "next/navigation";
import { autopiacPath } from "@/lib/routes";

export default function LegacySavedSearchesRedirect() {
  redirect(autopiacPath("/saved-searches"));
}
