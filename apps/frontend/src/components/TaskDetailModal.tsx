import type { Task } from '@/types';
import { LabelBadge } from './LabelBadge';

const STATUS_LABEL: Record<string, string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};

const STATUS_COLOR: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  IN_REVIEW: 'bg-purple-100 text-purple-700',
  DONE: 'bg-green-100 text-green-700',
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600',
};

function shortId(id: string) {
  return `OP-${id.slice(0, 6).toUpperCase()}`;
}

interface Props {
  task: Task;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <span className="text-xs text-gray-400 font-mono">{shortId(task.id)}</span>
            <h2 className="text-lg font-semibold text-gray-900 mt-0.5 break-words">{task.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        {task.description ? (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">Описание не добавлено</p>
        )}

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-100 pt-4">
          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Статус</span>
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[task.status]}`}>
              {STATUS_LABEL[task.status]}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Приоритет</span>
            <span className={`font-medium ${PRIORITY_COLOR[task.priority]}`}>
              {PRIORITY_LABEL[task.priority]}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Исполнитель</span>
            <span className="text-gray-700">
              {task.assignee ? task.assignee.email.split('@')[0] : '—'}
            </span>
          </div>

          <div>
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">Создано</span>
            <span className="text-gray-700">
              {new Date(task.createdAt).toLocaleDateString('ru-RU')}
            </span>
          </div>
        </div>

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <span className="text-xs text-gray-400 uppercase tracking-wide block mb-2">Лейблы</span>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map(({ label }) => (
                <LabelBadge key={label.id} label={label} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
