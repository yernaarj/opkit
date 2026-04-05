import { useState } from 'react';
import {
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';

const STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

function initials(email: string) {
  return email
    .split('@')[0]
    .split(/[._-]/)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

const AVATAR_COLORS = [
  'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
  'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
];
function avatarColor(email: string) {
  let hash = 0;
  for (const c of email) hash = (hash * 31 + c.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[hash];
}

// ─── Draggable task wrapper ───────────────────────────────────────────────────
function DraggableCard({
  task,
  onStatusChange,
  onDelete,
  onOpen,
  isUpdating,
}: {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpen: (task: Task) => void;
  isUpdating: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard
        task={task}
        isUpdating={isUpdating}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
        onClick={() => onOpen(task)}
      />
    </div>
  );
}

// ─── Droppable column ─────────────────────────────────────────────────────────
function DroppableColumn({
  memberId,
  status,
  tasks,
  onStatusChange,
  onDelete,
  onOpen,
  updatingIds,
}: {
  memberId: string;
  status: TaskStatus;
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpen: (task: Task) => void;
  updatingIds: Set<string>;
}) {
  const droppableId = `${memberId}:${status}`;
  const { setNodeRef } = useDroppable({ id: droppableId, data: { status } });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col gap-2 min-h-[60px] rounded-lg p-1"
    >
      {tasks.map((task) => (
        <DraggableCard
          key={task.id}
          task={task}
          isUpdating={updatingIds.has(task.id)}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
}

// ─── Member section ───────────────────────────────────────────────────────────
interface Props {
  memberId: string;
  email: string;
  tasks: Task[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onOpen: (task: Task) => void;
  updatingIds: Set<string>;
}

export function MemberSection({ memberId, email, tasks, onStatusChange, onDelete, onOpen, updatingIds }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  const byStatus = (status: TaskStatus) => tasks.filter((t) => t.status === status);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-left"
      >
        <span className={`w-6 h-6 rounded-full ${avatarColor(email)} text-white text-xs font-semibold flex items-center justify-center shrink-0`}>
          {initials(email)}
        </span>
        <span className="text-sm font-medium text-gray-700">{email.split('@')[0]}</span>
        <span className="text-xs text-gray-400 ml-1">{tasks.length}</span>
        <span className="ml-auto text-gray-400 text-xs">{collapsed ? '▶' : '▼'}</span>
      </button>

      {!collapsed && (
        <div className="grid grid-cols-4 gap-3 mt-2">
          {STATUSES.map((status) => (
            <DroppableColumn
              key={status}
              memberId={memberId}
              status={status}
              tasks={byStatus(status)}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onOpen={onOpen}
              updatingIds={updatingIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
