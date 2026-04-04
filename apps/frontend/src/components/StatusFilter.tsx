import type { TaskStatus } from '@/types';

const OPTIONS: { label: string; value: TaskStatus | 'ALL' }[] = [
  { label: 'Все', value: 'ALL' },
  { label: 'Новые', value: 'TODO' },
  { label: 'В работе', value: 'IN_PROGRESS' },
  { label: 'Готово', value: 'DONE' },
];

interface Props {
  value: TaskStatus | 'ALL';
  onChange: (v: TaskStatus | 'ALL') => void;
}

export function StatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            value === opt.value
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-600 border border-gray-300 hover:border-indigo-400'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
