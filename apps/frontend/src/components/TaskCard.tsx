import type { Task, TaskStatus } from '@/types';
import { LabelBadge } from './LabelBadge';

// Цветная точка приоритета (правый верхний угол)
const PRIORITY_DOT: Record<string, string | null> = {
  LOW:    null,
  MEDIUM: 'bg-yellow-400',
  HIGH:   'bg-orange-500',
  URGENT: 'bg-red-500',
};

// Короткий ID для отображения: берём первые 6 символов UUID
function shortId(id: string) {
  return `OP-${id.slice(0, 6).toUpperCase()}`;
}

interface Props {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onClick?: () => void;
  isUpdating?: boolean;
}

export function TaskCard({ task, onStatusChange, onDelete, onClick, isUpdating }: Props) {
  const dot = PRIORITY_DOT[task.priority];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-gray-200 p-3 flex flex-col gap-2 hover:border-gray-300 transition-all ${
        isUpdating ? 'opacity-50' : ''
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Top row: ID + priority dot */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 font-mono">{shortId(task.id)}</span>
        {dot && <span className={`w-2 h-2 rounded-full ${dot}`} title={task.priority} />}
      </div>

      {/* Title */}
      <p className="text-sm text-gray-800 font-medium leading-snug">{task.title}</p>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.map(({ label }) => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-1 pt-1 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
        {task.status !== 'IN_PROGRESS' && task.status !== 'IN_REVIEW' && task.status !== 'DONE' && (
          <button
            onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}
            disabled={isUpdating}
            className="text-xs px-2 py-0.5 text-indigo-600 hover:bg-indigo-50 rounded transition-colors disabled:opacity-50"
          >
            → В работе
          </button>
        )}
        {task.status === 'IN_PROGRESS' && (
          <button
            onClick={() => onStatusChange(task.id, 'IN_REVIEW')}
            disabled={isUpdating}
            className="text-xs px-2 py-0.5 text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50"
          >
            → Review
          </button>
        )}
        {task.status === 'IN_REVIEW' && (
          <button
            onClick={() => onStatusChange(task.id, 'DONE')}
            disabled={isUpdating}
            className="text-xs px-2 py-0.5 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
          >
            → Готово
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          disabled={isUpdating}
          className="ml-auto text-xs px-2 py-0.5 text-red-400 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
