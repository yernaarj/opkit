import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks.api';
import { useSocket } from '@/hooks/useSocket';
import { TaskCard } from '@/components/TaskCard';
import { TaskForm } from '@/components/TaskForm';
import { StatusFilter } from '@/components/StatusFilter';
import type { Task, TaskStatus } from '@/types';

export function TasksPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');

  // ─── Fetch tasks (re-fetches when filter changes) ──────────────────────────
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => tasksApi.getAll(filter === 'ALL' ? undefined : filter),
  });

  // ─── Create ────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    // Invalidate cache so the list refreshes after creation
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // ─── Update status ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // ─── Delete ────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  // ─── Real-time: apply WS task:updated without a full refetch ───────────────
  useSocket((updated) => {
    queryClient.setQueryData<Task[]>(['tasks', filter], (prev = []) =>
      prev.map((t) =>
        t.id === updated.id
          ? { ...t, status: updated.status, title: updated.title }
          : t,
      ),
    );
  });

  const pendingIds = new Set([
    updateMutation.variables?.id,
    deleteMutation.variables,
  ].filter(Boolean) as string[]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Мои задачи</h1>

      {/* Create form */}
      <TaskForm
        onSubmit={(v) => createMutation.mutateAsync(v).then(() => undefined)}
        loading={createMutation.isPending}
      />

      {/* Filter */}
      <StatusFilter value={filter} onChange={setFilter} />

      {/* Task list */}
      {isLoading ? (
        <p className="text-sm text-gray-400">Загрузка...</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-gray-400">Задач пока нет</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isUpdating={pendingIds.has(task.id)}
              onStatusChange={(id, status) => updateMutation.mutate({ id, status })}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
