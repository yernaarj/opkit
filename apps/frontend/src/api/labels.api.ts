import client from './client';
import type { Label } from '@/types';

export const labelsApi = {
  getAll: (boardId: string) =>
    client.get<Label[]>(`/boards/${boardId}/labels`).then((r) => r.data),

  create: (boardId: string, name: string, color?: string) =>
    client.post<Label>(`/boards/${boardId}/labels`, { name, color }).then((r) => r.data),

  remove: (boardId: string, labelId: string) =>
    client.delete(`/boards/${boardId}/labels/${labelId}`),

  addToTask: (taskId: string, labelId: string) =>
    client.post(`/tasks/${taskId}/labels/${labelId}`),

  removeFromTask: (taskId: string, labelId: string) =>
    client.delete(`/tasks/${taskId}/labels/${labelId}`),
};
