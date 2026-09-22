import type { RequestHandler } from "express";
import type { ZodType } from "zod";

type RequestTarget = "body" | "query" | "params";

export function validate(
  schema: ZodType,
  target: RequestTarget = "body"
): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      next(result.error);
      return;
    }

    res.locals[target] = result.data;

    next();
  };
}