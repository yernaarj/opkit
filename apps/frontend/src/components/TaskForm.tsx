import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PrioritySelect } from './PriorityBadge';
import { LabelBadge } from './LabelBadge';
import type { Label, TaskPriority, User } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Название обязательно').max(100),
  description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  labels?: Label[];
  members?: User[];
  onSubmit: (values: FormValues & { priority: TaskPriority; labelIds: string[]; assigneeId?: string }) => Promise<void>;
  loading?: boolean;
}

export function TaskForm({ labels = [], members = [], onSubmit, loading }: Props) {
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);
  const [assigneeId, setAssigneeId] = useState<string>('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const toggleLabel = (id: string) =>
    setSelectedLabelIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    );

  const submit = handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      priority,
      labelIds: selectedLabelIds,
      assigneeId: assigneeId || undefined,
    });
    reset();
    setPriority('MEDIUM');
    setSelectedLabelIds([]);
    setAssigneeId('');
  });

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <h2 className="font-semibold text-gray-700">Новая задача</h2>

      <div>
        <input
          {...register('title')}
          placeholder="Название *"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>

      <textarea
        {...register('description')}
        placeholder="Описание (необязательно)"
        rows={2}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="grid grid-cols-2 gap-3">
        {/* Приоритет */}
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Приоритет</span>
          <PrioritySelect value={priority} onChange={setPriority} />
        </div>

        {/* Исполнитель */}
        {members.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">Исполнитель</span>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Не назначен</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.email}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Лейблы */}
      {labels.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Лейблы</span>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => toggleLabel(label.id)}
                className={`rounded-full border-2 transition-all ${
                  selectedLabelIds.includes(label.id)
                    ? 'border-gray-800 scale-105'
                    : 'border-transparent opacity-60 hover:opacity-90'
                }`}
              >
                <LabelBadge label={label} />
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="self-end px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Создание...' : 'Создать'}
      </button>
    </form>
  );
}
