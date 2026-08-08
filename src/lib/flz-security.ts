import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export {
  flzProjectOrderSchema,
  flzProjectSchema,
  flzProjectUpdateSchema,
  flzSettingSchema,
} from "@/lib/flz-schemas";

export const ADMIN_EMAILS = [
  "floszbeni@gmail.com",
  "7bfloszb@gmail.com",
];

export function checkIsAdminEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return ADMIN_EMAILS.includes(lower) || lower.endsWith("@flz.works");
}

export async function verifyAdminUser() {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthenticated", status: 401, user: null };
  }

  const isAdmin = user.role === "ADMIN" || checkIsAdminEmail(user.email);
  if (!isAdmin) {
    return { error: "Forbidden. Admin access required.", status: 403, user };
  }

  // Ensure role is persisted as ADMIN in DB
  if (user.role !== "ADMIN") {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      user.role = "ADMIN";
    } catch {}
  }

  return { error: null, status: 200, user };
}
