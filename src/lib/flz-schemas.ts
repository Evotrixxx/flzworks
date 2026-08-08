import { z } from "zod";

export const flzProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  tools: z.string().min(1, "Tools are required").max(100, "Tools text is too long"),
  category: z.string().min(1, "Category is required").max(50, "Category is too long"),
  publishedAt: z.coerce.date().optional().nullable(),
  gradient: z.string().max(500, "Gradient is too long").optional().nullable(),
  body: z.string().max(2000, "Article text is too long").optional().nullable(),
  featured: z.boolean().default(false),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  linkUrl: z.string().max(500, "Link URL is too long").optional().nullable(),
  imageUrl: z.string().max(500, "Image URL is too long").optional().nullable(),
});

// Do not derive this with only `flzProjectSchema.partial()`: Zod keeps the
// inner defaults for omitted keys, which would turn a sort-order-only PUT into
// `{ featured: false, visible: true, sortOrder }`.
export const flzProjectUpdateSchema = flzProjectSchema.partial().extend({
  featured: z.boolean().optional(),
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const flzProjectOrderSchema = z.object({
  projects: z
    .array(
      z.object({
        id: z.string().min(1),
        sortOrder: z.number().int().min(0),
      }),
    )
    .min(1)
    .max(500),
});

export const flzSettingSchema = z.object({
  key: z.string().min(1, "Setting key is required").max(100),
  value: z.string().max(2000, "Setting value is too long"),
});
