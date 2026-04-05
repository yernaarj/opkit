import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { tasksApi } from '@/api/tasks.api';
import { boardsApi } from '@/api/boards.api';
import { labelsApi } from '@/api/labels.api';
import { useSocket } from '@/hooks/useSocket';
import { TaskForm } from '@/components/TaskForm';
import { BoardSidebar } from '@/components/BoardSidebar';
import { InviteMember } from '@/components/InviteMember';
import { LabelManager } from '@/components/LabelManager';
import { MemberSection } from '@/components/MemberSection';
import { TaskDetailModal } from '@/components/TaskDetailModal';
import type { Task, TaskStatus, User } from '@/types';

// Вкладки фильтрации задач
type Tab = 'all' | 'active' | 'backlog';

const TAB_LABELS: Record<Tab, string> = {
  all:     'All Issues',
  active:  'Active',
  backlog: 'Backlog',
};

// Колонки статусов с цветами
const STATUS_COLS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO',        label: 'Todo',        color: 'bg-gray-400' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-400' },
  { status: 'IN_REVIEW',   label: 'In Review',   color: 'bg-purple-500' },
  { status: 'DONE',        label: 'Done',        color: 'bg-green-500' },
];

// Фильтруем задачи по вкладке
function filterByTab(tasks: Task[], tab: Tab): Task[] {
  if (tab === 'active')  return tasks.filter((t) => t.status === 'IN_PROGRESS' || t.status === 'IN_REVIEW');
  if (tab === 'backlog') return tasks.filter((t) => t.status === 'TODO');
  return tasks;
}

export function TasksPage() {
  const queryClient = useQueryClient();
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Drag only starts after moving 8px — so regular clicks still work
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  // ─── Boards ───────────────────────────────────────────────────────────────
  const { data: boards = [] } = useQuery({
    queryKey: ['boards'],
    queryFn: boardsApi.getAll,
    select: (data) => {
      if (data.length > 0 && !selectedBoardId) setSelectedBoardId(data[0].id);
      return data;
    },
  });

  const selectedBoard = boards.find((b) => b.id === selectedBoardId);

  // Участники доски как User[]
  const boardMembers: User[] = useMemo(
    () => selectedBoard?.members.map((m) => m.user) ?? [],
    [selectedBoard],
  );

  // ─── Tasks ────────────────────────────────────────────────────────────────
  const { data: allTasks = [], isLoading } = useQuery({
    queryKey: ['tasks', selectedBoardId],
    queryFn: () => tasksApi.getAll(selectedBoardId ?? undefined),
    enabled: !!selectedBoardId,
  });

  const tasks = useMemo(() => filterByTab(allTasks, tab), [allTasks, tab]);

  // ─── Labels ───────────────────────────────────────────────────────────────
  const { data: boardLabels = [] } = useQuery({
    queryKey: ['labels', selectedBoardId],
    queryFn: () => labelsApi.getAll(selectedBoardId!),
    enabled: !!selectedBoardId,
  });

  // ─── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: tasksApi.remove,
    onSuccess: () => {
      setSelectedTask(null);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // ─── WebSocket реал-тайм ──────────────────────────────────────────────────
  useSocket((updated) => {
    queryClient.setQueryData<Task[]>(['tasks', selectedBoardId], (prev = []) =>
      prev.map((t) =>
        t.id === updated.id ? { ...t, status: updated.status, title: updated.title } : t,
      ),
    );
  });

  // ─── Группировка по участнику ─────────────────────────────────────────────
  const sections = useMemo(() => {
    const map = new Map<string, { email: string; tasks: Task[] }>();

    for (const member of boardMembers) {
      map.set(member.id, { email: member.email, tasks: [] });
    }
    map.set('unassigned', { email: 'Unassigned', tasks: [] });

    for (const task of tasks) {
      const key = task.assigneeId && map.has(task.assigneeId)
        ? task.assigneeId
        : 'unassigned';
      map.get(key)!.tasks.push(task);
    }

    return [...map.entries()]
      .filter(([, v]) => v.tasks.length > 0)
      .map(([id, v]) => ({ id, ...v }));
  }, [tasks, boardMembers]);

  const updatingIds = new Set(
    [updateMutation.variables?.id, deleteMutation.variables].filter(Boolean) as string[],
  );

  // ─── Drag and drop ────────────────────────────────────────────────────────
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const [, newStatus] = (over.id as string).split(':');
    const task = allTasks.find((t) => t.id === taskId);
    if (task && task.status !== newStatus) {
      updateMutation.mutate({ id: taskId, status: newStatus as TaskStatus });
    }
  }

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <BoardSidebar
        selectedBoardId={selectedBoardId}
        onSelect={(id) => { setSelectedBoardId(id); setTab('all'); setShowSettings(false); }}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col gap-0 min-w-0">
        {!selectedBoardId ? (
          <p className="text-sm text-gray-400 mt-8">Выберите или создайте доску слева</p>
        ) : (
          <>
            {/* Board header */}
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900">{selectedBoard?.name}</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowForm((v) => !v)}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  + Задача
                </button>
                <button
                  onClick={() => setShowSettings((v) => !v)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ⚙ Настройки
                </button>
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && selectedBoard && (
              <div className="flex flex-col gap-3 mb-4">
                <InviteMember board={selectedBoard} />
                <LabelManager board={selectedBoard} />
              </div>
            )}

            {/* Create form */}
            {showForm && (
              <div className="mb-4">
                <TaskForm
                  labels={boardLabels}
                  members={boardMembers}
                  onSubmit={async ({ labelIds, ...v }) => {
                    const task = await createMutation.mutateAsync({
                      ...v,
                      boardId: selectedBoardId!,
                    });
                    await Promise.all(labelIds.map((labelId) => labelsApi.addToTask(task.id, labelId)));
                    if (labelIds.length > 0) queryClient.invalidateQueries({ queryKey: ['tasks'] });
                    setShowForm(false);
                  }}
                  loading={createMutation.isPending}
                />
              </div>
            )}

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-200 mb-0">
              {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                    tab === t
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {TAB_LABELS[t]}
                  <span className="ml-1.5 text-xs text-gray-400">
                    {filterByTab(allTasks, t).length}
                  </span>
                </button>
              ))}
            </div>

            {/* Status columns header */}
            <div className="grid grid-cols-4 gap-3 py-2 border-b border-gray-100 mb-3">
              {STATUS_COLS.map(({ status, label, color }) => (
                <div key={status} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {label}
                  </span>
                  <span className="text-xs text-gray-400">
                    {tasks.filter((t) => t.status === status).length}
                  </span>
                </div>
              ))}
            </div>

            {/* Member sections */}
            {isLoading ? (
              <p className="text-sm text-gray-400">Загрузка...</p>
            ) : sections.length === 0 ? (
              <p className="text-sm text-gray-400">Задач пока нет</p>
            ) : (
              <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
                <div className="flex flex-col gap-4">
                  {sections.map(({ id, email, tasks: memberTasks }) => (
                    <MemberSection
                      key={id}
                      memberId={id}
                      email={email}
                      tasks={memberTasks}
                      updatingIds={updatingIds}
                      onStatusChange={(taskId, status) => updateMutation.mutate({ id: taskId, status })}
                      onDelete={(taskId) => deleteMutation.mutate(taskId)}
                      onOpen={setSelectedTask}
                    />
                  ))}
                </div>
              </DndContext>
            )}
          </>
        )}
      </div>

      {/* Task detail modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
