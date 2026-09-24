import express from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { requestId } from "./middleware/requestId.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { InMemoryTasksRepository } from "./modules/tasks/inMemoryTasks.repository.js";
import { TasksService } from "./modules/tasks/tasks.service.js";
import { createTasksRouter } from "./modules/tasks/tasks.routes.js";

export function createApp() {
  const app = express();

  app.use(requestId);
  app.disable("x-powered-by");
  app.use(helmet());

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : [],
      credentials: true,
    })
  );

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
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

  const repository = new InMemoryTasksRepository();
  const tasksService = new TasksService(repository);
  app.use("/api/v1/tasks", createTasksRouter(tasksService));

  app.use((_req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  app.use(errorHandler);

  return app;
}