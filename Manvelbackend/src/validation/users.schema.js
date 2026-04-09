import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.string().uuid("invalid user id"),
});

export const registerUserBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "name is required")
    .max(255, "name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "email is required")
    .max(320, "email is too long")
    .email("invalid email format"),
});
