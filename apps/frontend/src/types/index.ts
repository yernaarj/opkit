// ─── Domain types ────────────────────────────────────────────────────────────

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
}

export interface BoardMember {
  userId: string;
  joinedAt: string;
  user: User;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  owner: User;
  members: BoardMember[];
  _count: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  boardId: string;
}

export interface TaskLabel {
  labelId: string;
  label: Label;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  labels: TaskLabel[];
  assigneeId: string | null;
  assignee: { id: string; email: string } | null;
  userId: string;
  boardId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  user: User;
}
