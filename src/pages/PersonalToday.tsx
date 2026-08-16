import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Check, Plus, Sun, Trash2, Clock, Calendar, Edit2 } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  subscribeToTasks,
  subscribeToHabits,
  createTask,
  updateTask,
  deleteTask,
  toggleHabitDate,
  createHabit,
} from '../services/db';
import { Task, Habit, Priority } from '../types';

export const PersonalToday: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State for Task
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskStartTime, setTaskStartTime] = useState('09:00');
  const [taskEndTime, setTaskEndTime] = useState('10:00');
  const [taskPriority, setTaskPriority] = useState<Priority>('medium');

  // Form State for Habit
  const [habitName, setHabitName] = useState('');
  const [habitTime, setHabitTime] = useState('08:00');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const unsubTasks = subscribeToTasks(userId, (loadedTasks) => {
      const personalOnly = loadedTasks.filter((t) => !t.space || t.space === 'personal');
      setTasks(personalOnly);
    });

    const unsubHabits = subscribeToHabits(userId, (loadedHabits) => {
      setHabits(loadedHabits);
    });

    return () => {
      unsubTasks();
      unsubHabits();
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
      });
      setEditingTask(null);
    } else {
      const newTask: Task = {
        id: 'task_' + Date.now(),
        userId,
        space: 'personal',
        title: taskTitle.trim(),
        date: taskDate,
        startTime: taskStartTime,
        endTime: taskEndTime,
        priority: taskPriority,
        status: 'planned',
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
    setTaskStartTime(task.startTime || '09:00');
    setTaskEndTime(task.endTime || '10:00');
    setTaskPriority(task.priority || 'medium');
    setIsAddTaskOpen(true);
  };

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    const newHabit: Habit = {
      id: 'habit_' + Date.now(),
      userId,
      name: habitName.trim(),
      frequency: 'daily',
      preferredTime: habitTime,
      streak: 0,
      completionHistory: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await createHabit(userId, newHabit);
    setHabitName('');
    setIsAddHabitOpen(false);
  };

  const completedHabitsCount = habits.filter((h) => h.completionHistory?.[todayStr]).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Today</h1>
          <p className="text-xs text-text-secondary mt-1">
            Personal life-side ritual · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            onClick={() => {
              setEditingTask(null);
              setTaskTitle('');
              setIsAddTaskOpen(true);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* Habits Today Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-red-main" /> Habits for Today ({completedHabitsCount}/{habits.length} Complete)
          </span>
          <button
            onClick={() => setIsAddHabitOpen(true)}
            className="text-xs text-red-main hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add Habit
          </button>
        </div>

        {habits.length === 0 ? (
          <div className="py-6 text-center text-xs text-text-secondary border border-border-main border-dashed rounded-lg">
            No habits configured yet. Click "Add Habit" to start a streak.
          </div>
        ) : (
          <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
            {habits.map((habit) => {
              const isCompleted = !!habit.completionHistory?.[todayStr];
              return (
                <div
                  key={habit.id}
                  className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleHabitDate(userId, habit.id, todayStr)}
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        isCompleted
                          ? 'bg-red-main text-white'
                          : 'bg-bg-main hairline-border text-transparent hover:border-red-main'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <div>
                      <h3
                        className={`text-sm font-normal ${
                          isCompleted ? 'line-through text-text-secondary' : 'text-text-main'
                        }`}
                      >
                        {habit.name}
                      </h3>
                      <span className="text-xs text-text-secondary">{habit.preferredTime || 'Anytime'}</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-red-main">
                    {habit.streak || 0}d streak
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Personal Tasks List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block">
            Personal Tasks ({tasks.length})
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary border border-border-main border-dashed rounded-lg">
            No personal tasks for today. Click "Add Task" to create one.
          </div>
        ) : (
          <div className="divide-y divide-border-main hairline-border rounded-lg bg-bg-main">
            {tasks.map((task) => {
              const isDone = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className="py-3 px-3 flex items-center justify-between hover:bg-surface/40 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        isDone
                          ? 'bg-red-main text-white'
                          : 'border border-border-main hover:border-red-main'
                      }`}
                    >
                      {isDone && <Check className="w-3 h-3" />}
                    </button>
                    <div>
                      <h3
                        className={`text-sm font-normal ${
                          isDone ? 'line-through text-text-secondary' : 'text-text-main'
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-text-secondary mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> {task.startTime} – {task.endTime}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{task.priority} Priority</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1 hover:text-text-main text-text-secondary cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 hover:text-red-main text-text-secondary cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        title={editingTask ? 'Edit Personal Task' : 'Add Personal Task'}
      >
        <form onSubmit={handleSaveTask} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Studio cable organization or grocery run"
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

      {/* Add Habit Modal */}
      <Modal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        title="Add Daily Habit"
      >
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <Input
            label="Habit Name"
            placeholder="e.g. Morning meditation or Synth practice"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Preferred Time / Schedule"
            placeholder="e.g. 08:00 AM or Morning"
            value={habitTime}
            onChange={(e) => setHabitTime(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsAddHabitOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

