import { z } from "zod";

const httpOrHttpsUrl = z
  .string()
  .trim()
  .min(1, "original_url is required")
  .max(2048, "original_url is too long")
  .url("invalid URL")
  .refine(
    (value) => /^https?:\/\//i.test(value),
    "original_url must use http or https",
  );

export const createShortUrlBodySchema = z.object({
  user_id: z.string().uuid("user_id must be a valid UUID"),
  original_url: httpOrHttpsUrl,
  expires_at: z
    .union([z.string().datetime(), z.null()])
    .optional(),
});
