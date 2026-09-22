import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import { requestId } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import tasksRouter from "./modules/tasks/tasks.routes";

export function createApp() {
  const app = express();
  app.use(requestId);

  app.disable("x-powered-by");

  app.use(helmet());

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(express.json({ limit: "100kb" }));

  app.use(compression({ threshold: 1024 }));

  app.get("/health/live", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/health/ready", (_req, res) => {
  res.json({ status: "ready" });
});
app.use("/api/v1/tasks", tasksRouter);
app.use(errorHandler);


  return app;
}