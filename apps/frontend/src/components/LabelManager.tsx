import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { labelsApi } from '@/api/labels.api';
import { LabelBadge } from './LabelBadge';
import { useAuthStore } from '@/store/auth.store';
import type { Board } from '@/types';

// Палитра цветов на выбор (как в Linear)
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899',
  '#64748b', '#0ea5e9',
];

interface Props {
  board: Board;
}

export function LabelManager({ board }: Props) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isOwner = board.ownerId === user?.id;

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[5]);
  const [error, setError] = useState('');

  const { data: labels = [] } = useQuery({
    queryKey: ['labels', board.id],
    queryFn: () => labelsApi.getAll(board.id),
  });

  const createMutation = useMutation({
    mutationFn: () => labelsApi.create(board.id, name.trim(), color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels', board.id] });
      setName('');
      setError('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Ошибка'));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (labelId: string) => labelsApi.remove(board.id, labelId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['labels', board.id] }),
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <h3 className="font-semibold text-gray-700 text-sm">Лейблы — {board.name}</h3>

      {/* Существующие лейблы */}
      <div className="flex flex-wrap gap-2">
        {labels.length === 0 && <p className="text-xs text-gray-400">Лейблов пока нет</p>}
        {labels.map((label) => (
          <LabelBadge
            key={label.id}
            label={label}
            onRemove={isOwner ? () => removeMutation.mutate(label.id) : undefined}
          />
        ))}
      </div>

      {/* Форма создания — только владелец */}
      {isOwner && (
        <form
          onSubmit={(e) => { e.preventDefault(); if (name.trim()) createMutation.mutate(); }}
          className="flex flex-col gap-2"
        >
          <div className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Название лейбла"
              maxLength={40}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Создать
            </button>
          </div>

          {/* Палитра цветов */}
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-5 h-5 rounded-full border-2 transition-transform ${
                  color === c ? 'border-gray-800 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}
        </form>
      )}
    </div>
  );
}
