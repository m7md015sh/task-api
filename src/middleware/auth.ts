import type { RequestHandler } from "express";

export const auth: RequestHandler = (req, _res, next) => {
  req.user = {
    id: "user-1",
  };

  next();
};