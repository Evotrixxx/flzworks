import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";

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
  if (user.role !== "ADMIN") {
    return { error: "Forbidden. Admin access required.", status: 403, user };
  }
  return { error: null, status: 200, user };
}
