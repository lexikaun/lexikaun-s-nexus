import React, { useState } from 'react';
import {
  ListTodo,
  Plus,
  Check,
  RotateCcw,
  Trash2,
  Edit2,
  Clock,
  Music2,
  Play,
  ArrowUpDown,
  Filter,
  Sparkles,
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useMusic } from '../../context/MusicContext';
import { Task, TaskStatus } from '../../types';

interface TasksListProps {
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onOpenReschedule: (task: Task) => void;
  onOpenBeatDetail: (beatId: string) => void;
}

export const TasksList: React.FC<TasksListProps> = ({
  onOpenAddTask,
  onEditTask,
  onOpenReschedule,
  onOpenBeatDetail,
}) => {
  const { tasks, setTaskStatus, deleteTask, reorderTasks, goals } = usePlanner();
  const { getBeatById, playBeat } = useMusic();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickStart, setQuickStart] = useState('14:00');
  const [quickEnd, setQuickEnd] = useState('15:00');
  const { addTask } = usePlanner();

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const [sh, sm] = quickStart.split(':').map(Number);
    const [eh, em] = quickEnd.split(':').map(Number);
    const duration = Math.max(15, (eh * 60 + em) - (sh * 60 + sm));

    await addTask({
      title: quickTitle.trim(),
      date: new Date().toISOString().split('T')[0],
      startTime: quickStart,
      endTime: quickEnd,
      durationMinutes: duration,
      priority: 'medium',
      status: 'planned',
    });

    setQuickTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === 'completed') return t.status === 'completed';
    if (statusFilter === 'pending') return t.status !== 'completed';
    if (statusFilter === 'music') return !!t.associatedBeatId;
    return true;
  });

  const moveTask = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= tasks.length) return;
    const reordered = [...tasks];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);
    reorderTasks(reordered);
  };

  return (
    <div
      id="tasks-management-container"
      className="rounded-2xl border border-[#1E2430] bg-[#0F1218] p-5.5 shadow-sm transition"
    >
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ListTodo className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Tasks & Time Allocation
            </h3>
            <p className="text-xs text-slate-400">
              Granular action items, estimated blocks, and linked audio productions.
            </p>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
              statusFilter === 'all'
                ? 'border border-slate-700 bg-[#141820] text-emerald-400'
                : 'border border-[#1E2430] bg-[#0A0C10] text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
              statusFilter === 'pending'
                ? 'border border-slate-700 bg-[#141820] text-emerald-400'
                : 'border border-[#1E2430] bg-[#0A0C10] text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`rounded-xl px-3 py-1 text-xs font-semibold transition ${
              statusFilter === 'completed'
                ? 'border border-slate-700 bg-[#141820] text-emerald-400'
                : 'border border-[#1E2430] bg-[#0A0C10] text-slate-400 hover:text-slate-200'
            }`}
          >
            Done
          </button>
          <button
            onClick={() => setStatusFilter('music')}
            className={`flex items-center space-x-1 rounded-xl px-3 py-1 text-xs font-semibold transition ${
              statusFilter === 'music'
                ? 'border border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                : 'border border-[#1E2430] bg-[#0A0C10] text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music2 className="h-3 w-3 text-emerald-400" />
            <span>Music Tasks</span>
          </button>
        </div>
      </div>

      {/* Quick Fast Inline Add Task Input */}
      <form onSubmit={handleQuickAdd} className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Quick add a task for today... (e.g. Master sub-bass / Prepare deck)"
          className="min-w-[200px] flex-1 rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs text-slate-100 outline-none transition focus:border-emerald-500/60 focus:bg-[#141820]"
        />

        <div className="flex items-center space-x-1 font-mono text-xs text-slate-400">
          <input
            type="time"
            value={quickStart}
            onChange={(e) => setQuickStart(e.target.value)}
            className="rounded-lg border border-[#1E2430] bg-[#0A0C10] px-2 py-1.5 text-xs text-slate-200"
          />
          <span>→</span>
          <input
            type="time"
            value={quickEnd}
            onChange={(e) => setQuickEnd(e.target.value)}
            className="rounded-lg border border-[#1E2430] bg-[#0A0C10] px-2 py-1.5 text-xs text-slate-200"
          />
        </div>

        <button
          type="submit"
          disabled={!quickTitle.trim()}
          className="flex items-center space-x-1 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-bold text-black shadow-md shadow-emerald-500/20 transition hover:bg-emerald-400 disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Add</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddTask}
          className="rounded-xl border border-[#1E2430] bg-[#141820] px-3 py-2 text-xs font-semibold text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
          title="Open advanced task modal"
        >
          Detailed
        </button>
      </form>

      {/* Task List */}
      <div className="mt-4 space-y-2">
        {filteredTasks.map((task, idx) => {
          const isCompleted = task.status === 'completed';
          const isInProgress = task.status === 'in_progress';
          const associatedBeat = task.associatedBeatId
            ? getBeatById(task.associatedBeatId)
            : null;
          const parentGoal = task.goalId
            ? goals.find((g) => g.id === task.goalId)
            : null;

          return (
            <div
              key={task.id}
              className={`group flex flex-col justify-between gap-2.5 rounded-xl border p-3.5 transition sm:flex-row sm:items-center ${
                isCompleted
                  ? 'border-[#1E2430] bg-[#0A0C10]/60 opacity-60'
                  : isInProgress
                  ? 'border-indigo-500/40 bg-indigo-500/10'
                  : 'border-[#1E2430] bg-[#141820] hover:border-slate-700'
              }`}
            >
              {/* Left Checkbox & Title */}
              <div className="flex items-start space-x-3">
                <button
                  onClick={() =>
                    setTaskStatus(task.id, isCompleted ? 'planned' : 'completed')
                  }
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition ${
                    isCompleted
                      ? 'border-emerald-500 bg-emerald-500 text-black'
                      : 'border-slate-700 bg-[#0F1218] hover:border-emerald-500/60 text-transparent'
                  }`}
                  title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                >
                  {isCompleted && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-sm font-semibold tracking-tight ${
                        isCompleted
                          ? 'text-slate-500 line-through'
                          : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </span>

                    {parentGoal && (
                      <span className="rounded-md border border-slate-700 bg-[#0F1218] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                        🎯 {parentGoal.title}
                      </span>
                    )}

                    {isInProgress && (
                      <span className="rounded-md border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400">
                        In Progress
                      </span>
                    )}
                  </div>

                  {task.description && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {task.description}
                    </p>
                  )}

                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <div className="flex items-center space-x-1 font-mono text-[11px] text-emerald-400">
                      <Clock className="h-3 w-3" />
                      <span>{task.startTime} - {task.endTime}</span>
                      <span className="text-slate-500">({task.durationMinutes}m)</span>
                    </div>

                    {task.priority !== 'low' && (
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          task.priority === 'critical'
                            ? 'text-rose-400'
                            : task.priority === 'high'
                            ? 'text-amber-400'
                            : 'text-indigo-400'
                        }`}
                      >
                        • {task.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Associated Beat, Reorder, Edit, Delete */}
              <div className="flex items-center space-x-2 self-end sm:self-center">
                {associatedBeat && (
                  <div className="flex items-center space-x-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs">
                    <button
                      onClick={() => playBeat(associatedBeat)}
                      className="text-emerald-400 hover:text-emerald-300"
                      title="Play beat"
                    >
                      <Play className="h-3 w-3 fill-emerald-400" />
                    </button>
                    <button
                      onClick={() => onOpenBeatDetail(associatedBeat.id)}
                      className="max-w-[110px] truncate font-semibold text-emerald-300 hover:underline"
                      title="Open beat in library"
                    >
                      🎵 {associatedBeat.title}
                    </button>
                  </div>
                )}

                {/* Reorder Buttons */}
                <div className="flex items-center opacity-40 transition group-hover:opacity-100">
                  <button
                    onClick={() => moveTask(idx, idx - 1)}
                    disabled={idx === 0}
                    className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveTask(idx, idx + 1)}
                    disabled={idx === filteredTasks.length - 1}
                    className="p-1 text-slate-500 hover:text-slate-200 disabled:opacity-20"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                <button
                  onClick={() => onOpenReschedule(task)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0F1218] hover:text-slate-200"
                  title="Reschedule task"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => onEditTask(task)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-[#0F1218] hover:text-slate-200"
                  title="Edit task"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1E2430] py-8 text-center">
            <ListTodo className="h-8 w-8 text-slate-600" />
            <p className="mt-2 text-xs text-slate-400">
              No tasks found for this filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
