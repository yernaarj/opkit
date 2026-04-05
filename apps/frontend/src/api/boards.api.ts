import client from './client';
import type { Board } from '@/types';

export const boardsApi = {
  getAll: () =>
    client.get<Board[]>('/boards').then((r) => r.data),

  create: (name: string) =>
    client.post<Board>('/boards', { name }).then((r) => r.data),

  remove: (id: string) =>
    client.delete(`/boards/${id}`),

  inviteMember: (boardId: string, email: string) =>
    client.post(`/boards/${boardId}/members`, { email }).then((r) => r.data),

  removeMember: (boardId: string, memberId: string) =>
    client.delete(`/boards/${boardId}/members/${memberId}`),
};
