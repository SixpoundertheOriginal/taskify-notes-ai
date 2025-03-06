
export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "completed";

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  status: Status;
  dueDate?: string;
  reminderTime?: string; // New field for storing reminder time
  createdAt: string;
  subtasks?: Subtask[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
