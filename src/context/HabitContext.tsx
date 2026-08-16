import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Habit } from '../types';
import { useAuth } from './AuthContext';
import { subscribeToHabits, saveHabit, deleteHabitDoc } from '../services/db';

interface HabitContextType {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  recordHabitLog: (habitId: string, completed: boolean) => Promise<void>;
}

const HabitContext = createContext<HabitContextType | null>(null);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      setHabits([]);
      return;
    }
    const unsubscribe = subscribeToHabits(user.uid, (data) => {
      setHabits(data.sort((a, b) => b.createdAt - a.createdAt));
    });
    return () => unsubscribe();
  }, [user]);

  const addHabit = async (data: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'streak'>) => {
    if (!user?.uid) return;
    const now = Date.now();
    const newHabit: Habit = {
      ...data,
      id: `habit_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.uid,
      streak: 0,
      createdAt: now,
      updatedAt: now,
    };
    await saveHabit(user.uid, newHabit);
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    if (!user?.uid) return;
    const existing = habits.find((h) => h.id === id);
    if (!existing) return;
    const updated: Habit = {
      ...existing,
      ...updates,
      updatedAt: Date.now(),
    };
    await saveHabit(user.uid, updated);
  };

  const deleteHabit = async (id: string) => {
    if (!user?.uid) return;
    await deleteHabitDoc(user.uid, id);
  };

  const recordHabitLog = async (habitId: string, completed: boolean) => {
    if (!user?.uid) return;
    const existing = habits.find((h) => h.id === habitId);
    if (!existing) return;
    
    // Simplistic streak logic for now (increment on complete, ignore otherwise)
    // In a real app, we would log this to a HabitLog collection and calculate streak from logs
    const newStreak = completed ? existing.streak + 1 : Math.max(0, existing.streak - 1);
    
    await updateHabit(habitId, { streak: newStreak });
  };

  return (
    <HabitContext.Provider value={{ habits, addHabit, updateHabit, deleteHabit, recordHabitLog }}>
      {children}
    </HabitContext.Provider>
  );
};

export const useHabits = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
};
