import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { CheckCircle, Plus, Calendar, Disc, Trash2, Edit2, Clock, Check } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  subscribeToTasks,
  subscribeToGoals,
  createTask,
  updateTask,
  deleteTask,
} from '../services/db';
import { Task, Goal, Priority } from '../types';

export const ProfessionalToday: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [tasks, setTasks] = useState<Task[]>([]);
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

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const unsubTasks = subscribeToTasks(userId, (loadedTasks) => {
      const profTasks = loadedTasks.filter((t) => t.space === 'professional' || (!t.space && t.associatedBeatId));
      setTasks(profTasks);
    });

    const unsubGoals = subscribeToGoals(userId, (loadedGoals) => {
      setGoals(loadedGoals);
    });

    return () => {
      unsubTasks();
      unsubGoals();
    };
  }, [userId]);

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
      });
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: 'task_' + Date.now(),
        userId,
        space: 'professional',
        title: taskTitle.trim(),
        date: taskDate,
        startTime: taskStartTime,
        endTime: taskEndTime,
        priority: taskPriority,
        status: 'planned',
        goalId: selectedGoalId || undefined,
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
    setIsAddTaskOpen(true);
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
                      <h3 className={`text-sm font-normal ${isDone ? 'text-text-secondary line-through' : 'text-text-main'}`}>
                        {item.title}
                      </h3>
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
    </div>
  );
};

