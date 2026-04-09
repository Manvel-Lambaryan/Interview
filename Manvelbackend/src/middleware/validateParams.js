import { ZodError } from "zod";

export function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: e.flatten().fieldErrors,
        });
      }
      next(e);
    }
  };
}
