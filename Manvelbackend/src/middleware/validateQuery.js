import { ZodError } from "zod";

export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
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
