import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../shared/errors/AppError";

export const errorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  _next
) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
        requestId: req.requestId,
      },
    });

    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined
          ? { details: err.details }
          : {}),
        requestId: req.requestId,
      },
    });

    return;
  }

  console.error(err);

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      requestId: req.requestId,
    },
  });
};