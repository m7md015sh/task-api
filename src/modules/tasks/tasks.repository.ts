import type { Task } from "./tasks.types";

export interface TasksRepository {
  findById(id: string): Promise<Task | null>;

  findByIdAndOwner(
    id: string,
    ownerId: string
  ): Promise<Task | null>;

  findMany(params: {
    ownerId: string;
    limit: number;
    cursor?: string;
    done?: boolean;
    sort: "createdAt" | "-createdAt" | "title";
  }): Promise<{
    items: Task[];
    nextCursor: string | null;
  }>;

  create(task: Task): Promise<Task>;

  update(
    id: string,
    ownerId: string,
    patch: Partial<Pick<Task, "title" | "done" | "dueDate">>
  ): Promise<Task | null>;

  delete(id: string, ownerId: string): Promise<boolean>;
}