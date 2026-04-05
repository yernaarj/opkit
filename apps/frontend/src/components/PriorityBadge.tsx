import type { TaskPriority } from '@/types';

const CONFIG: Record<TaskPriority, { label: string; icon: string; className: string }> = {
  LOW:    { label: 'Низкий',    icon: '▼', className: 'text-gray-400' },
  MEDIUM: { label: 'Средний',   icon: '●', className: 'text-blue-400' },
  HIGH:   { label: 'Высокий',   icon: '▲', className: 'text-orange-500' },
  URGENT: { label: 'Срочный',   icon: '!!', className: 'text-red-500 font-bold' },
};

interface Props {
  priority: TaskPriority;
  showLabel?: boolean;
}

export function PriorityBadge({ priority, showLabel = false }: Props) {
  const { label, icon, className } = CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${className}`} title={label}>
      <span>{icon}</span>
      {showLabel && <span>{label}</span>}
    </span>
  );
}

// Селектор для формы
interface SelectProps {
  value: TaskPriority;
  onChange: (v: TaskPriority) => void;
}

const PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function PrioritySelect({ value, onChange }: SelectProps) {
  return (
    <div className="flex gap-2">
      {PRIORITIES.map((p) => {
        const { label, icon, className } = CONFIG[p];
        return (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
              value === p
                ? 'border-indigo-400 bg-indigo-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${className}`}
            title={label}
          >
            <span>{icon}</span>
            <span className="text-gray-700">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
