import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const ADMIN_EMAILS = [
  "floszbeni@gmail.com",
  "seller@autopiac.test",
];

export function checkIsAdminEmail(email: string): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return ADMIN_EMAILS.includes(lower) || lower.endsWith("@flz.works");
}

export const flzProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  tools: z.string().min(1, "Tools are required").max(100, "Tools text is too long"),
  category: z.string().min(1, "Category is required").max(50, "Category is too long"),
  age: z.string().max(50, "Age label is too long").optional().nullable(),
  gradient: z.string().max(500, "Gradient is too long").optional().nullable(),
  description: z.string().max(2000, "Description is too long").optional().nullable(),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  linkUrl: z.string().max(500, "Link URL is too long").optional().nullable(),
  imageUrl: z.string().max(500, "Image URL is too long").optional().nullable(),
});

export const flzSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required").max(100),
  value: z.string().max(2000, "Setting value is too long"),
});

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
