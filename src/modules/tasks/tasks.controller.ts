import type { Request, Response } from "express";
import type { TasksService } from "./tasks.service";
import { toTaskResponse } from "./tasks.schema.js";
export class TasksController {
  constructor(
    private readonly tasksService: TasksService
  ) {}

async createTask(req: Request, res: Response) {
  console.log("USER:", req.user);
  console.log("BODY:", res.locals.body);

  const body = res.locals.body;

  const task = await this.tasksService.createTask({
    ownerId: req.user.id,
    title: body.title,
    dueDate: body.dueDate,
  });

  res.status(201).json({
    data: toTaskResponse(task),
  });
}

  async getTask(req: Request, res: Response) {
    const task = await this.tasksService.getTask({
      id: res.locals.params.id,
      ownerId: req.user.id,
    });

    res.status(200).json({
      data: task,
    });
  }

  async listTasks(req: Request, res: Response) {
    const query = res.locals.query;

    const result = await this.tasksService.listTasks({
      ownerId: req.user.id,
      limit: query.limit,
      cursor: query.cursor,
      done: query.done,
      sort: query.sort,
    });

    res.status(200).json({
      data: result.items,
      meta: {
        nextCursor: result.nextCursor,
      },
    });
  }

  async updateTask(req: Request, res: Response) {
    const task = await this.tasksService.updateTask({
      id: res.locals.params.id,
      ownerId: req.user.id,
      patch: res.locals.body,
    });

    res.status(200).json({
      data: task,
    });
  }

  async deleteTask(req: Request, res: Response) {
    await this.tasksService.deleteTask({
      id: res.locals.params.id,
      ownerId: req.user.id,
    });

    res.status(204).send();
  }
}