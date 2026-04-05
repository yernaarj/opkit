import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { boardsApi } from '@/api/boards.api';
import { useAuthStore } from '@/store/auth.store';
import type { Board } from '@/types';

interface Props {
  selectedBoardId: string | null;
  onSelect: (boardId: string) => void;
}

export function BoardSidebar({ selectedBoardId, onSelect }: Props) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [newBoardName, setNewBoardName] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: boardsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: boardsApi.create,
    onSuccess: (board) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      onSelect(board.id);
      setNewBoardName('');
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: boardsApi.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      createMutation.mutate(newBoardName.trim());
    }
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Доски</span>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-indigo-500 hover:text-indigo-700 text-lg leading-none"
          title="Создать доску"
        >
          +
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="flex gap-1">
          <input
            autoFocus
            value={newBoardName}
            onChange={(e) => setNewBoardName(e.target.value)}
            placeholder="Название доски"
            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-2 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            ОК
          </button>
        </form>
      )}

      <nav className="flex flex-col gap-1">
        {boards.map((board: Board) => (
          <div key={board.id} className="group flex items-center gap-1">
            <button
              onClick={() => onSelect(board.id)}
              className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedBoardId === board.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="block truncate">{board.name}</span>
              <span className={`text-xs ${selectedBoardId === board.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                {board._count.tasks} задач · {board.members.length} участ.
              </span>
            </button>

            {/* Удалить доску — только владелец */}
            {board.ownerId === user?.id && (
              <button
                onClick={() => {
                  if (confirm(`Удалить доску «${board.name}»?`)) {
                    deleteMutation.mutate(board.id);
                  }
                }}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs px-1 transition-opacity"
                title="Удалить доску"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
