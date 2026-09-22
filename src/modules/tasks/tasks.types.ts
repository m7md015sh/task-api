export interface Task {
  id: string;
  ownerId: string;
  title: string;
  done: boolean;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}