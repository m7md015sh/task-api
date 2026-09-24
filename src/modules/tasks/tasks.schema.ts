import { z } from "zod";
import type { Task } from "./tasks.types.js";

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    done: z.boolean().default(false),
    dueDate: z.string().datetime().optional(),
  })
  .strict();

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "at least one field is required",
  });

export const idParamsSchema = z.object({
  id: z.string().regex(/^t_[\w-]+$/),
});

export const listQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
    done: z
      .enum(["true", "false"])
      .optional()
      .transform((value) => {
        if (value === undefined) return undefined;
        return value === "true";
      }),
    sort: z.enum(["createdAt", "-createdAt", "title"]).default("-createdAt"),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;

export const taskResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  done: z.boolean(),
  dueDate: z.string().datetime().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export function toTaskResponse(task: Task) {
  return taskResponseSchema.parse(task);
}