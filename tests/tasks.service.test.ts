import { describe, it, expect, vi, beforeEach } from "vitest";
import { TasksService } from "../src/modules/tasks/tasks.service.js";
import type { TasksRepository } from "../src/modules/tasks/tasks.repository.js";
import type { Task } from "../src/modules/tasks/tasks.types.js";
import { NotFoundError } from "../src/shared/errors/AppError.js";

// ── Mock Repository ───────────────────────────────────────────
const mockRepo: TasksRepository = {
  findById: vi.fn(),
  findByIdAndOwner: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: "t_123",
  ownerId: "user-1",
  title: "Test task",
  done: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe("TasksService", () => {
  let service: TasksService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new TasksService(mockRepo);
  });

  describe("createTask", () => {
    it("should create a task and return it", async () => {
      const task = makeTask();
      vi.mocked(mockRepo.create).mockResolvedValue(task);

      const result = await service.createTask({
        ownerId: "user-1",
        title: "Test task",
      });

      expect(mockRepo.create).toHaveBeenCalledOnce();
      expect(result.title).toBe("Test task");
      expect(result.ownerId).toBe("user-1");
      expect(result.done).toBe(false);
    });
  });

  describe("getTask", () => {
    it("should return the task when found", async () => {
      const task = makeTask();
      vi.mocked(mockRepo.findByIdAndOwner).mockResolvedValue(task);

      const result = await service.getTask({ id: "t_123", ownerId: "user-1" });
      expect(result).toEqual(task);
    });

    it("should throw NotFoundError when task does not exist", async () => {
      vi.mocked(mockRepo.findByIdAndOwner).mockResolvedValue(null);

      await expect(
        service.getTask({ id: "t_999", ownerId: "user-1" })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("updateTask", () => {
    it("should update and return the task", async () => {
      const updated = makeTask({ title: "Updated" });
      vi.mocked(mockRepo.update).mockResolvedValue(updated);

      const result = await service.updateTask({
        id: "t_123",
        ownerId: "user-1",
        patch: { title: "Updated" },
      });

      expect(result.title).toBe("Updated");
    });

    it("should throw NotFoundError when task does not exist", async () => {
      vi.mocked(mockRepo.update).mockResolvedValue(null);

      await expect(
        service.updateTask({ id: "t_999", ownerId: "user-1", patch: { title: "x" } })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("deleteTask", () => {
    it("should delete successfully", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(true);

      await expect(
        service.deleteTask({ id: "t_123", ownerId: "user-1" })
      ).resolves.toBeUndefined();
    });

    it("should throw NotFoundError when task does not exist", async () => {
      vi.mocked(mockRepo.delete).mockResolvedValue(false);

      await expect(
        service.deleteTask({ id: "t_999", ownerId: "user-1" })
      ).rejects.toThrow(NotFoundError);
    });
  });
});
