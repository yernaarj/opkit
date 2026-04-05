import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/api/boards.api';
import { useAuthStore } from '@/store/auth.store';
import type { Board } from '@/types';

interface Props {
  board: Board;
}

export function InviteMember({ board }: Props) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const isOwner = board.ownerId === user?.id;

  const inviteMutation = useMutation({
    mutationFn: (email: string) => boardsApi.inviteMember(board.id, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setEmail('');
      setError('');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg ?? 'Ошибка'));
    },
  });

  const removeMutation = useMutation({
    mutationFn: (memberId: string) => boardsApi.removeMember(board.id, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['boards'] }),
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) inviteMutation.mutate(email.trim());
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3">
      <h3 className="font-semibold text-gray-700 text-sm">
        Участники — {board.name}
      </h3>

      {/* Список участников */}
      <ul className="flex flex-col gap-1">
        {board.members.map((m) => (
          <li key={m.userId} className="flex items-center justify-between text-sm">
            <span className="text-gray-700">{m.user.email}</span>
            <div className="flex items-center gap-2">
              {m.userId === board.ownerId && (
                <span className="text-xs text-indigo-500">Владелец</span>
              )}
              {isOwner && m.userId !== board.ownerId && (
                <button
                  onClick={() => removeMutation.mutate(m.userId)}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  Удалить
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Форма приглашения — только для владельца */}
      {isOwner && (
        <form onSubmit={handleInvite} className="flex flex-col gap-2 mt-1">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email участника"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Добавить
            </button>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
        </form>
      )}
    </div>
  );
}
