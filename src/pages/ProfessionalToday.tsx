import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { CheckCircle, Plus, Calendar, Disc, Trash2, Edit2, Clock, Check, RotateCw, Sparkles } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  subscribeToTasks,
  subscribeToGoals,
  createTask,
  updateTask,
  deleteTask,
} from '../services/db';
import { expandRecurringTask } from '../utils/recurrence';
import { generateSmartRescheduleSuggestion } from '../utils/smartReschedule';
import { Task, Goal, Priority, RecurrenceType, SmartRescheduleSuggestion } from '../types';

export const ProfessionalToday: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [rawTasks, setRawTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State for Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskStartTime, setTaskStartTime] = useState('10:00');
  const [taskEndTime, setTaskEndTime] = useState('12:00');
  const [taskPriority, setTaskPriority] = useState<Priority>('high');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [taskRecurrence, setTaskRecurrence] = useState<RecurrenceType>('none');

  // Smart Reschedule State
  const [rescheduleTask, setRescheduleTask] = useState<Task | null>(null);
  const [actualMinutesWorked, setActualMinutesWorked] = useState<number>(30);
  const [rescheduleSuggestion, setRescheduleSuggestion] = useState<SmartRescheduleSuggestion | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const unsubTasks = subscribeToTasks(userId, (loadedTasks) => {
      setRawTasks(loadedTasks);
    });

    const unsubGoals = subscribeToGoals(userId, (loadedGoals) => {
      setGoals(loadedGoals);
    });

    return () => {
      unsubTasks();
      unsubGoals();
    };
  }, [userId]);

  // Expand recurring tasks for today's view
  const tasks = useMemo(() => {
    const todayList: Task[] = [];
    for (const t of rawTasks) {
      if (t.recurrence && t.recurrence !== 'none') {
        const occurrences = expandRecurringTask(t, todayStr, todayStr);
        todayList.push(...occurrences);
      } else if (t.date === todayStr || !t.date) {
        todayList.push(t);
      }
    }
    return todayList;
  }, [rawTasks, todayStr]);

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      await updateTask(userId, editingTask.id, {
        title: taskTitle.trim(),
        date: taskDate,
        startTime: taskStartTime,
        endTime: taskEndTime,
        priority: taskPriority,
        goalId: selectedGoalId || undefined,
        recurrence: taskRecurrence === 'none' ? undefined : taskRecurrence,
      });
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: 'task_' + Date.now(),
        userId,
        title: taskTitle.trim(),
        date: taskDate,
        startTime: taskStartTime,
        endTime: taskEndTime,
        priority: taskPriority,
        status: 'planned',
        goalId: selectedGoalId || undefined,
        recurrence: taskRecurrence === 'none' ? undefined : taskRecurrence,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await createTask(userId, newTask);
    }

    setTaskTitle('');
    setIsAddTaskOpen(false);
  };

  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'planned' : 'completed';
    await updateTask(userId, task.id, {
      status: nextStatus,
      completedAt: nextStatus === 'completed' ? Date.now() : undefined,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(userId, taskId);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDate(task.date || todayStr);
    setTaskStartTime(task.startTime || '10:00');
    setTaskEndTime(task.endTime || '12:00');
    setTaskPriority(task.priority || 'high');
    setSelectedGoalId(task.goalId || '');
    setTaskRecurrence((typeof task.recurrence === 'string' ? task.recurrence : task.recurrence?.freq) || 'none');
    setIsAddTaskOpen(true);
  };

  const handleOpenReschedule = (task: Task) => {
    setRescheduleTask(task);
    setActualMinutesWorked(30);
    const suggestion = generateSmartRescheduleSuggestion(task, 30);
    setRescheduleSuggestion(suggestion);
  };

  const handleActualMinutesChange = (mins: number) => {
    setActualMinutesWorked(mins);
    if (rescheduleTask) {
      const suggestion = generateSmartRescheduleSuggestion(rescheduleTask, mins);
      setRescheduleSuggestion(suggestion);
    }
  };

  const handleApplyReschedule = async () => {
    if (!rescheduleTask || !rescheduleSuggestion) return;

    await updateTask(userId, rescheduleTask.id, {
      status: 'completed',
      actualDurationMinutes: actualMinutesWorked,
      completedAt: Date.now(),
      notes: `Partial session completed: ${actualMinutesWorked}m. Remaining ${rescheduleSuggestion.unfinishedMinutes}m rescheduled.`,
    });

    const followUpTask: Task = {
      id: 'task_' + Date.now(),
      userId,
      title: `${rescheduleTask.title} (Remaining Part)`,
      date: rescheduleSuggestion.targetDate,
      startTime: rescheduleSuggestion.suggestedStartTime,
      endTime: rescheduleSuggestion.suggestedEndTime,
      priority: rescheduleTask.priority,
      status: 'planned',
      goalId: rescheduleTask.goalId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createTask(userId, followUpTask);

    setRescheduleTask(null);
    setRescheduleSuggestion(null);
  };

  // Find the active / in-progress or first upcoming task
  const activeTask = tasks.find((t) => t.status === 'in_progress') || tasks.find((t) => t.status === 'planned');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Today</h1>
          <p className="text-xs text-text-secondary mt-1">
            Professional ritual · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="gap-2"
          onClick={() => {
            setEditingTask(null);
            setTaskTitle('');
            setSelectedGoalId('');
            setIsAddTaskOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Today's Focus Section */}
      {goals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
              Today's Focus ({goals.filter((g) => g.status === 'active').length} Active Goals)
            </span>
          </div>

          <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
            {goals.filter((g) => g.status === 'active').slice(0, 3).map((goal) => {
              const linkedTasks = tasks.filter((t) => t.goalId === goal.id);
              const doneCount = linkedTasks.filter((t) => t.status === 'completed').length;
              return (
                <div
                  key={goal.id}
                  className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-surface hairline-border text-red-main font-mono uppercase">
                      {goal.priority}
                    </span>
                    <div>
                      <h3 className="text-sm font-normal text-text-main">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-xs text-text-secondary line-clamp-1">{goal.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-text-secondary font-mono">
                    {doneCount}/{linkedTasks.length} tasks
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Task Section (Divider row style) */}
      {activeTask && (
        <div>
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block mb-2">
            Current Task
          </span>
          <div className="hairline-border rounded-lg bg-bg-main border-l-2 border-l-red-main">
            <div className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => handleToggleTask(activeTask)}
                  className="w-4 h-4 rounded border border-border-main hover:border-red-main transition-colors cursor-pointer shrink-0"
                />
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-main font-medium inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-main animate-pulse" />
                      In Progress ({activeTask.startTime} – {activeTask.endTime})
                    </span>
                    {activeTask.goalId && (
                      <span className="text-xs text-text-secondary">
                        • {goals.find((g) => g.id === activeTask.goalId)?.title}
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-medium text-text-main mt-0.5 truncate">{activeTask.title}</h2>
                </div>
              </div>

              <Button
                size="sm"
                variant="primary"
                className="gap-2 shrink-0 ml-3"
                onClick={() => handleToggleTask(activeTask)}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Done</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Today's Schedule / Timeline */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium">
            Timeline ({tasks.length} tasks)
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary border border-border-main border-dashed rounded-lg">
            No professional tasks scheduled for today. Click "Add Task" to start.
          </div>
        ) : (
          <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
            {tasks.map((item) => {
              const isDone = item.status === 'completed';
              const linkedGoal = goals.find((g) => g.id === item.goalId);
              const isRecurring = !!item.recurrence && item.recurrence !== 'none';
              return (
                <div
                  key={item.id}
                  className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(item)}
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-red-main text-white'
                          : 'border border-border-main hover:border-red-main'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3" />}
                    </button>
                    <span className="text-xs text-text-secondary font-mono w-24 shrink-0">
                      {item.startTime} – {item.endTime}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className={`text-sm font-normal ${isDone ? 'text-text-secondary line-through' : 'text-text-main'}`}>
                          {item.title}
                        </h3>
                        {isRecurring && (
                          <RotateCw className="w-3 h-3 text-text-secondary shrink-0" title="Recurring Routine" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                        {linkedGoal && <span>{linkedGoal.title}</span>}
                        {linkedGoal && <span>•</span>}
                        <span className="capitalize">{item.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${isDone ? 'text-text-secondary' : 'text-red-main'}`}>
                      {isDone ? 'Done' : item.status === 'in_progress' ? 'Active' : 'Planned'}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                      {!isDone && (
                        <button
                          onClick={() => handleOpenReschedule(item)}
                          className="p-1 hover:text-red-main text-text-secondary cursor-pointer"
                          title="Partial completion / Smart reschedule"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1 hover:text-text-main text-text-secondary cursor-pointer"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(item.id)}
                        className="p-1 hover:text-red-main text-text-secondary cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title={editingTask ? 'Edit Professional Task' : 'Add Professional Task'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Vocal Layering for EP Track 2"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Scheduled Date"
              type="date"
              value={taskDate}
              onChange={(e) => setTaskDate(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Recurrence</label>
              <select
                value={taskRecurrence}
                onChange={(e) => setTaskRecurrence(e.target.value as RecurrenceType)}
                className="w-full bg-surface border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-red-main"
              >
                <option value="none">One-time (No Recurrence)</option>
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly (Every 7 days)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Time"
              type="time"
              value={taskStartTime}
              onChange={(e) => setTaskStartTime(e.target.value)}
              required
            />
            <Input
              label="End Time"
              type="time"
              value={taskEndTime}
              onChange={(e) => setTaskEndTime(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as Priority)}
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
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
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
            <Button type="button" variant="secondary" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingTask ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Smart Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleTask}
        onClose={() => setRescheduleTask(null)}
        title="Smart Partial Rescheduling"
      >
        {rescheduleTask && (
          <div className="space-y-4">
            <div className="p-3 bg-surface hairline-border rounded-lg space-y-1">
              <div className="text-xs text-text-secondary">Selected Task</div>
              <div className="text-sm font-medium text-text-main">{rescheduleTask.title}</div>
              <div className="text-xs text-text-secondary font-mono">
                Planned: {rescheduleTask.startTime} – {rescheduleTask.endTime}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">
                Actual Minutes Completed
              </label>
              <input
                type="number"
                min="0"
                max="300"
                step="15"
                value={actualMinutesWorked}
                onChange={(e) => handleActualMinutesChange(Number(e.target.value))}
                className="w-full bg-surface border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-red-main"
              />
            </div>

            {rescheduleSuggestion ? (
              <div className="p-3 bg-red-main/10 border border-red-main/20 rounded-lg space-y-2">
                <div className="text-xs font-medium text-red-main flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Smart Proposal
                </div>
                <p className="text-xs text-text-main leading-relaxed">
                  {rescheduleSuggestion.reason}
                </p>
                <div className="text-xs font-mono text-text-secondary">
                  Target Date: <strong className="text-text-main">{rescheduleSuggestion.targetDate}</strong> | New Slot: <strong className="text-text-main">{rescheduleSuggestion.suggestedStartTime} – {rescheduleSuggestion.suggestedEndTime}</strong>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface hairline-border rounded-lg text-xs text-text-secondary">
                You completed the full scheduled duration! Task will be marked fully done without rescheduling.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setRescheduleTask(null)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={handleApplyReschedule}>
                Apply & Reschedule
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};


