import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Plus, Calendar, Trash2, Edit2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import {
  subscribeToGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from '../services/db';
import { Goal, Priority, GoalStatus } from '../types';

export const PersonalGoals: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.uid || 'local-producer-01';

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<GoalStatus>('active');

  useEffect(() => {
    const unsub = subscribeToGoals(userId, (loadedGoals) => {
      const personalGoals = loadedGoals.filter((g) => !g.space || g.space === 'personal');
      setGoals(personalGoals);
    });
    return () => unsub();
  }, [userId]);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingGoal) {
      await updateGoal(userId, editingGoal.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline || undefined,
        priority,
        status,
      });
      setEditingGoal(null);
    } else {
      const newGoal: Goal = {
        id: 'goal_' + Date.now(),
        userId,
        space: 'personal',
        title: title.trim(),
        description: description.trim() || undefined,
        deadline: deadline || undefined,
        priority,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await createGoal(userId, newGoal);
    }

    resetForm();
    setIsModalOpen(false);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setDeadline(goal.deadline || '');
    setPriority(goal.priority || 'medium');
    setStatus(goal.status || 'active');
    setIsModalOpen(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    await deleteGoal(userId, goalId);
  };

  const handleToggleStatus = async (goal: Goal) => {
    const nextStatus: GoalStatus = goal.status === 'completed' ? 'active' : 'completed';
    await updateGoal(userId, goal.id, { status: nextStatus });
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDeadline('');
    setPriority('medium');
    setStatus('active');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">Personal Goals</h1>
          <p className="text-xs text-text-secondary mt-1">Life aspirations, fitness & personal development</p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="gap-2"
          onClick={() => {
            setEditingGoal(null);
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </Button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="py-10 text-center text-xs text-text-secondary border border-border-main border-dashed rounded-lg">
          No personal goals found. Click "New Goal" to establish your first milestone.
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map((g) => {
            const isCompleted = g.status === 'completed';
            return (
              <Card key={g.id} className="p-4 group">
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-bg-main hairline-border text-text-secondary font-mono uppercase">
                        {g.priority}
                      </span>
                      {g.deadline && (
                        <span className="text-xs text-text-secondary flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Due {g.deadline}
                        </span>
                      )}
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          isCompleted ? 'bg-red-main/10 text-red-main' : 'bg-surface text-text-secondary'
                        }`}
                      >
                        {g.status}
                      </span>
                    </div>

                    <h2
                      className={`text-sm font-medium ${
                        isCompleted ? 'line-through text-text-secondary' : 'text-text-main'
                      }`}
                    >
                      {g.title}
                    </h2>
                    {g.description && <p className="text-xs text-text-secondary">{g.description}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(g)}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        isCompleted ? 'text-red-main hover:text-red-main/80' : 'text-text-secondary hover:text-text-main'
                      }`}
                      title={isCompleted ? 'Mark Active' : 'Mark Completed'}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(g)}
                      className="p-1.5 text-text-secondary hover:text-text-main transition-colors cursor-pointer"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(g.id)}
                      className="p-1.5 text-text-secondary hover:text-red-main transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGoal ? 'Edit Personal Goal' : 'New Personal Goal'}
      >
        <form onSubmit={handleSaveGoal} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Run 10K Marathon in under 50 minutes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="text-xs text-text-secondary font-medium">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Milestones, strategy, or context..."
              rows={3}
              className="w-full bg-surface border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-red-main resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-xs text-text-secondary font-medium">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full bg-surface border border-border-main rounded-md px-3 py-2 text-sm text-text-main focus:outline-none focus:border-red-main"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingGoal ? 'Save Changes' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

