import client from './client';
import type { Task, TaskStatus } from '@/types';

export interface CreateTaskDto {
  title: string;
  description?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export const tasksApi = {
  getAll: (status?: TaskStatus) =>
    client
      .get<Task[]>('/tasks', { params: status ? { status } : {} })
      .then((r) => r.data),

  create: (dto: CreateTaskDto) =>
    client.post<Task>('/tasks', dto).then((r) => r.data),

  update: (id: string, dto: UpdateTaskDto) =>
    client.patch<Task>(`/tasks/${id}`, dto).then((r) => r.data),

  remove: (id: string) => client.delete(`/tasks/${id}`),
};
