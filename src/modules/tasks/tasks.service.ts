import { randomUUID } from "node:crypto";
import type { TasksRepository } from "./tasks.repository.js";
import type { Task } from "./tasks.types.js";
import { NotFoundError } from "../../shared/errors/AppError.js";

export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async createTask(params: {
    ownerId: string;
    title: string;
    dueDate?: string;
  }): Promise<Task> {
    const now = new Date().toISOString();

    const task: Task = {
      id: `t_${randomUUID()}`,
      ownerId: params.ownerId,
      title: params.title,
      done: false,
      dueDate: params.dueDate,
      createdAt: now,
      updatedAt: now,
    };

    return this.tasksRepository.create(task);
  }

  async getTask(params: { id: string; ownerId: string }): Promise<Task> {
    const task = await this.tasksRepository.findByIdAndOwner(
      params.id,
      params.ownerId
    );

    if (!task) {
      throw new NotFoundError("Task");
    }

    return task;
  }

  async listTasks(params: {
    ownerId: string;
    limit: number;
    cursor?: string;
    done?: boolean;
    sort: "createdAt" | "-createdAt" | "title";
  }) {
    return this.tasksRepository.findMany(params);
  }

  async updateTask(params: {
    id: string;
    ownerId: string;
    patch: Partial<Pick<Task, "title" | "done" | "dueDate">>;
  }): Promise<Task> {
    const task = await this.tasksRepository.update(
      params.id,
      params.ownerId,
      params.patch
    );

    if (!task) {
      throw new NotFoundError("Task");
    }

    return task;
  }

  async deleteTask(params: { id: string; ownerId: string }): Promise<void> {
    const deleted = await this.tasksRepository.delete(
      params.id,
      params.ownerId
    );

    if (!deleted) {
      throw new NotFoundError("Task");
    }
  }
}