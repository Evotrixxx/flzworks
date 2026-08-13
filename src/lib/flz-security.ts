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
  return ADMIN_EMAILS.includes(lower);
}

// Only safe to call right after a Google Sign-In email has been verified
// (see api/auth/google/route.ts) — an unverified email must never reach this check.
export function isFlzWorksDomainEmail(email: string): boolean {
  if (!email) return false;
  return email.toLowerCase().endsWith("@flz.works");
}

export function getLocalStudioAdmin() {
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.ALLOW_LOCAL_STUDIO_BYPASS === "1"
  ) {
    return {
      id: "local-studio-admin",
      email: "local-studio@localhost",
      name: "Local Studio Admin",
      role: "ADMIN",
    };
  }

  return null;
}

export async function verifyAdminUser() {
  const user = getLocalStudioAdmin() ?? (await getCurrentUser());
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
