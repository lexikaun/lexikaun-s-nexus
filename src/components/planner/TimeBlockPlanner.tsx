import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Trash2,
  Edit2,
  Check,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import {
  subscribeToTasks,
  subscribeToGoals,
  createTask,
  updateTask,
  deleteTask,
} from '../../services/db';
import { Task, Goal, Priority, SpaceType } from '../../types';

interface TimeBlockPlannerProps {
  space: SpaceType;
  title: string;
  subtitle: string;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 to 22:00

export const TimeBlockPlanner: React.FC<TimeBlockPlannerProps> = ({ space, title, subtitle }) => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(selectedDate);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formPriority, setFormPriority] = useState<Priority>('medium');
  const [formGoalId, setFormGoalId] = useState<string>('');

  useEffect(() => {
    const unsubTasks = subscribeToTasks(userId, (loadedTasks) => {
      const filtered = loadedTasks.filter((t) => !t.space || t.space === space);
      setTasks(filtered);
    });

    const unsubGoals = subscribeToGoals(userId, (loadedGoals) => {
      const filtered = loadedGoals.filter((g) => !g.space || g.space === space);
      setGoals(filtered);
    });

    return () => {
      unsubTasks();
      unsubGoals();
    };
  }, [userId, space]);

  const handleDateShift = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const getWeekDays = () => {
    const curr = new Date(selectedDate);
    const dayOfWeek = curr.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - distanceToMonday);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return {
        dateStr: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
      };
    });
  };

  const handleOpenCreateForSlot = (timeString: string, dateStr?: string) => {
    setEditingTask(null);
    setFormTitle('');
    setFormDate(dateStr || selectedDate);
    setFormStartTime(timeString);

    const [hour] = timeString.split(':').map(Number);
    const endH = String(Math.min(23, hour + 1)).padStart(2, '0');
    setFormEndTime(`${endH}:00`);

    setFormPriority('medium');
    setFormGoalId('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDate(task.date || selectedDate);
    setFormStartTime(task.startTime || '09:00');
    setFormEndTime(task.endTime || '10:00');
    setFormPriority(task.priority || 'medium');
    setFormGoalId(task.goalId || '');
    setIsModalOpen(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTask) {
      await updateTask(userId, editingTask.id, {
        title: formTitle.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        priority: formPriority,
        goalId: formGoalId || undefined,
      });
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: 'task_' + Date.now(),
        userId,
        space,
        title: formTitle.trim(),
        date: formDate,
        startTime: formStartTime,
        endTime: formEndTime,
        priority: formPriority,
        status: 'planned',
        goalId: formGoalId || undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await createTask(userId, newTask);
    }

    setIsModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(userId, taskId);
  };

  const handleToggleComplete = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'planned' : 'completed';
    await updateTask(userId, task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? Date.now() : undefined,
    });
  };

  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const weekDays = getWeekDays();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">{title}</h1>
          <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-surface hairline-border rounded-md p-0.5 text-xs">
            <button
              onClick={() => setViewMode('day')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'day' ? 'bg-bg-main text-text-main font-medium' : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                viewMode === 'week' ? 'bg-bg-main text-text-main font-medium' : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Week
            </button>
          </div>

          {/* Date Navigator */}
          <div className="flex items-center bg-surface hairline-border rounded-md px-2 py-1 gap-2 text-xs">
            <button
              onClick={() => handleDateShift(viewMode === 'day' ? -1 : -7)}
              className="text-text-secondary hover:text-text-main cursor-pointer"
              title="Previous"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-medium text-text-main font-mono">
              {new Date(selectedDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                weekday: viewMode === 'day' ? 'short' : undefined,
              })}
            </span>
            <button
              onClick={() => handleDateShift(viewMode === 'day' ? 1 : 7)}
              className="text-text-secondary hover:text-text-main cursor-pointer"
              title="Next"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => handleOpenCreateForSlot('09:00')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Block Time</span>
          </Button>
        </div>
      </div>

      {/* DAY VIEW */}
      {viewMode === 'day' && (
        <div className="hairline-border rounded-lg bg-bg-main divide-y divide-border-main">
          {HOURS.map((hour) => {
            const timeString = `${String(hour).padStart(2, '0')}:00`;
            const nextTimeString = `${String(hour + 1).padStart(2, '0')}:00`;

            // Tasks that fall into this hour slot
            const slotTasks = dayTasks.filter((t) => {
              const startH = parseInt(t.startTime.split(':')[0], 10);
              return startH === hour;
            });

            return (
              <div
                key={hour}
                className="flex min-h-[52px] group hover:bg-surface/20 transition-colors"
              >
                {/* Time Label */}
                <div className="w-20 sm:w-24 p-3 text-xs font-mono text-text-secondary border-r border-border-main shrink-0 flex items-start">
                  {timeString}
                </div>

                {/* Content Slot */}
                <div className="flex-1 p-2 flex flex-col gap-1.5 justify-center">
                  {slotTasks.length > 0 ? (
                    slotTasks.map((task) => {
                      const isDone = task.status === 'completed';
                      const goal = goals.find((g) => g.id === task.goalId);
                      return (
                        <div
                          key={task.id}
                          className={`w-full p-2.5 rounded bg-surface border-l-2 ${
                            isDone ? 'border-l-border-main opacity-60' : 'border-l-red-main'
                          } text-xs text-text-main flex items-center justify-between group/task`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                isDone
                                  ? 'bg-red-main text-white'
                                  : 'border border-border-main hover:border-red-main'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3" />}
                            </button>
                            <div className="truncate">
                              <span className={`font-normal ${isDone ? 'line-through text-text-secondary' : 'text-text-main'}`}>
                                {task.title}
                              </span>
                              {goal && (
                                <span className="text-[11px] text-text-secondary ml-2">
                                  • {goal.title}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-text-secondary font-mono text-[11px]">
                              {task.startTime} – {task.endTime}
                            </span>
                            <div className="flex items-center gap-1 opacity-0 group-hover/task:opacity-100 transition-opacity pl-2">
                              <button
                                onClick={() => handleOpenEdit(task)}
                                className="p-1 hover:text-text-main text-text-secondary cursor-pointer"
                                title="Edit"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="p-1 hover:text-red-main text-text-secondary cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <button
                      onClick={() => handleOpenCreateForSlot(timeString)}
                      className="w-full h-8 text-left text-xs text-transparent group-hover:text-text-secondary/40 px-2 rounded hover:bg-surface/40 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Click to schedule at {timeString}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEK VIEW */}
      {viewMode === 'week' && (
        <div className="hairline-border rounded-lg bg-bg-main overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[700px] divide-x divide-border-main">
            {weekDays.map(({ dateStr, dayName, dayNum }) => {
              const isToday = dateStr === new Date().toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const scheduledTasks = tasks.filter((t) => t.date === dateStr);

              return (
                <div key={dateStr} className="flex flex-col min-h-[480px]">
                  {/* Column Header */}
                  <div
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3 text-center border-b border-border-main cursor-pointer transition-colors ${
                      isSelected ? 'bg-surface' : 'hover:bg-surface/30'
                    }`}
                  >
                    <div className="text-[11px] text-text-secondary uppercase font-mono tracking-wider">
                      {dayName}
                    </div>
                    <div
                      className={`text-sm font-medium mt-0.5 inline-block px-1.5 rounded ${
                        isToday ? 'bg-red-main text-white' : 'text-text-main'
                      }`}
                    >
                      {dayNum}
                    </div>
                  </div>

                  {/* Tasks Column */}
                  <div className="flex-1 p-2 space-y-2">
                    {scheduledTasks.map((task) => {
                      const isDone = task.status === 'completed';
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleOpenEdit(task)}
                          className={`p-2 rounded bg-surface border-l-2 ${
                            isDone ? 'border-l-border-main opacity-60' : 'border-l-red-main'
                          } text-xs text-text-main cursor-pointer hover:bg-surface/80 transition-colors space-y-1`}
                        >
                          <div className="font-mono text-[10px] text-text-secondary flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> {task.startTime} – {task.endTime}
                          </div>
                          <div className={`font-normal leading-tight ${isDone ? 'line-through text-text-secondary' : 'text-text-main'}`}>
                            {task.title}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => handleOpenCreateForSlot('09:00', dateStr)}
                      className="w-full py-2 text-center text-xs text-text-secondary/40 hover:text-text-secondary hover:bg-surface/30 rounded border border-dashed border-border-main/50 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Schedule / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Scheduled Task' : 'Schedule New Task'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Master stem bounce or sound design session"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Scheduled Date"
            type="date"
            value={formDate}
            onChange={(e) => setFormDate(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={formStartTime}
              onChange={(e) => setFormStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={formEndTime}
              onChange={(e) => setFormEndTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Priority</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as Priority)}
                className="w-full bg-surface border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-red-main"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Linked Goal</label>
              <select
                value={formGoalId}
                onChange={(e) => setFormGoalId(e.target.value)}
                className="w-full bg-surface border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-red-main"
              >
                <option value="">No goal (Standalone)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? 'Save Schedule' : 'Schedule Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
