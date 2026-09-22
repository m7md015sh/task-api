import { Router } from "express";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";
import { InMemoryTasksRepository } from "./inMemoryTasks.repository";
import { auth } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createTaskSchema,
  updateTaskSchema,
  idParamsSchema,
  listQuerySchema,
} from "./tasks.schema";

const router = Router();

const repository = new InMemoryTasksRepository();
const service = new TasksService(repository);
const controller = new TasksController(service);

router.post(
  "/",
  auth,
  validate(createTaskSchema, "body"),
  controller.createTask.bind(controller)
);

router.get(
  "/",
  auth,
  validate(listQuerySchema, "query"),
  controller.listTasks.bind(controller)
);

router.get(
  "/:id",
  auth,
  validate(idParamsSchema, "params"),
  controller.getTask.bind(controller)
);

router.patch(
  "/:id",
  auth,
  validate(idParamsSchema, "params"),
  validate(updateTaskSchema, "body"),
  controller.updateTask.bind(controller)
);

router.delete(
  "/:id",
  auth,
  validate(idParamsSchema, "params"),
  controller.deleteTask.bind(controller)
);

export default router;
