import { z } from "zod";

export const attachTagBodySchema = z.union([
  z
    .object({
      tag_name: z
        .string()
        .trim()
        .min(1, "tag_name is required")
        .max(100, "tag_name is too long"),
    })
    .strict(),
  z
    .object({
      tag_id: z.string().uuid("tag_id must be a valid UUID"),
    })
    .strict(),
]);
