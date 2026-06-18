import { redirect } from "next/navigation";
import { autopiacPath } from "@/lib/routes";

export default async function LegacyCarRedirect({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(autopiacPath(`/cars/${id}`));
}
