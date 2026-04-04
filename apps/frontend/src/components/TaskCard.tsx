import type { Task, TaskStatus } from '@/types';

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Новая',
  IN_PROGRESS: 'В работе',
  DONE: 'Готово',
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
};

// Next status in the task lifecycle
const NEXT_STATUS: Record<TaskStatus, TaskStatus | null> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: null,
};

interface Props {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  isUpdating?: boolean;
}

export function TaskCard({ task, onStatusChange, onDelete, isUpdating }: Props) {
  const next = NEXT_STATUS[task.status];

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-2 transition-opacity ${isUpdating ? 'opacity-60' : ''}`}>
      {/* Header: title + status badge */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-gray-800 text-sm leading-snug">{task.title}</p>
        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[task.status]}`}>
          {STATUS_LABELS[task.status]}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500">{task.description}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-gray-400">
          {new Date(task.createdAt).toLocaleDateString('ru-RU')}
        </p>
        <div className="flex gap-2">
          {next && (
            <button
              onClick={() => onStatusChange(task.id, next)}
              disabled={isUpdating}
              className="text-xs px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 disabled:opacity-50 transition-colors"
            >
              → {STATUS_LABELS[next]}
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            disabled={isUpdating}
            className="text-xs px-3 py-1 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
