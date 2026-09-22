import { randomUUID } from "node:crypto";
import type { RequestHandler } from "express";

export const requestId: RequestHandler = (req, res, next) => {
  const id = randomUUID();

  res.setHeader("X-Request-Id", id);

  req.requestId = id;

  next();
};