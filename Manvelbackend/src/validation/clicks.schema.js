import { z } from "zod";
import { isValidAnalyticsDateInput } from "../modules/clicks/clicks.analytics.js";

const clickDeviceSchema = z.enum(["mobile", "desktop", "tablet", "unknown"]);
const analyticsDateInputSchema = z
  .string()
  .refine(isValidAnalyticsDateInput, "Expected ISO datetime or YYYY-MM-DD");

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
    from: analyticsDateInputSchema.optional(),
    to: analyticsDateInputSchema.optional(),
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
