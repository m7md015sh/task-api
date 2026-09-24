import type { RequestHandler } from "express";

export const auth: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.user = { id: "user-1" };
  next();
};