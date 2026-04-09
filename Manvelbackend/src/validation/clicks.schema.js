import { z } from "zod";

const clickDeviceSchema = z.enum(["mobile", "desktop", "tablet", "unknown"]);

export const shortCodeParamsSchema = z.object({
  short_code: z.string().trim().min(1, "short_code is required"),
});

export const recordClickBodySchema = z
  .object({
    country: z
      .string()
      .trim()
      .min(1, "country cannot be empty")
      .max(100, "country is too long")
      .optional(),
    device: clickDeviceSchema.optional(),
  })
  .strict()
  .default({});

export const clickAnalyticsQuerySchema = z
  .object({
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .refine(
    ({ from, to }) =>
      from === undefined ||
      to === undefined ||
      new Date(from).getTime() <= new Date(to).getTime(),
    {
      message: "`from` must be earlier than or equal to `to`",
      path: ["from"],
    },
  );
