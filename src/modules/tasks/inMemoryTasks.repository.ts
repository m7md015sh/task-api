import type { Task } from "./tasks.types";
import type { TasksRepository } from "./tasks.repository";

export class InMemoryTasksRepository implements TasksRepository {
  private tasks: Task[] = [];

  async findById(id: string): Promise<Task | null> {
    const task = this.tasks.find((task) => task.id === id);

    return task ? { ...task } : null;
  }

  async findByIdAndOwner(
    id: string,
    ownerId: string
  ): Promise<Task | null> {
    const task = this.tasks.find(
      (task) => task.id === id && task.ownerId === ownerId
    );

    return task ? { ...task } : null;
  }

  async findMany(params: {
    ownerId: string;
    limit: number;
    cursor?: string;
    done?: boolean;
    sort: "createdAt" | "-createdAt" | "title";
  }): Promise<{
    items: Task[];
    nextCursor: string | null;
  }> {
    let filteredTasks = this.tasks.filter(
      (task) => task.ownerId === params.ownerId
    );

    if (params.done !== undefined) {
      filteredTasks = filteredTasks.filter(
        (task) => task.done === params.done
      );
    }

    filteredTasks.sort((a, b) => {
      if (params.sort === "-createdAt") {
        const dateComparison =
          b.createdAt.localeCompare(a.createdAt);

        return dateComparison !== 0
          ? dateComparison
          : a.id.localeCompare(b.id);
      }

      if (params.sort === "createdAt") {
        const dateComparison =
          a.createdAt.localeCompare(b.createdAt);

        return dateComparison !== 0
          ? dateComparison
          : a.id.localeCompare(b.id);
      }

      const titleComparison = a.title.localeCompare(b.title);

      return titleComparison !== 0
        ? titleComparison
        : a.id.localeCompare(b.id);
    });

    let startIndex = 0;

    if (params.cursor) {
      const decodedCursor = Number(
        Buffer.from(params.cursor, "base64").toString("utf8")
      );

      if (
        Number.isInteger(decodedCursor) &&
        decodedCursor >= 0
      ) {
        startIndex = decodedCursor;
      }
    }

    const items = filteredTasks.slice(
      startIndex,
      startIndex + params.limit
    );

    const nextIndex = startIndex + items.length;

    const nextCursor =
      nextIndex < filteredTasks.length
        ? Buffer.from(String(nextIndex)).toString("base64")
        : null;

    return {
      items: items.map((task) => ({ ...task })),
      nextCursor,
    };
  }

  async create(task: Task): Promise<Task> {
    this.tasks.push({ ...task });

    return { ...task };
  }

  async update(
    id: string,
    ownerId: string,
    patch: Partial<Pick<Task, "title" | "done" | "dueDate">>
  ): Promise<Task | null> {
    const task = this.tasks.find(
      (task) => task.id === id && task.ownerId === ownerId
    );

    if (!task) {
      return null;
    }

    Object.assign(task, patch);

    task.updatedAt = new Date().toISOString();

    return { ...task };
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const index = this.tasks.findIndex(
      (task) => task.id === id && task.ownerId === ownerId
    );

    if (index === -1) {
      return false;
    }

    this.tasks.splice(index, 1);

    return true;
  }
}