import React from 'react';
import { TimeBlockingTimeline } from '../dashboard/TimeBlockingTimeline';
import { TasksList } from '../dashboard/TasksList';
import { Task } from '../../types';

interface PlannerProps {
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onOpenBeatDetail: (beatId: string) => void;
}

export const Planner: React.FC<PlannerProps> = ({
  onOpenAddTask,
  onEditTask,
  onOpenBeatDetail,
}) => {
  return (
    <div className="mx-auto max-w-5xl space-y-12 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light tracking-tight text-slate-100">Planner</h1>
        <p className="mt-2 text-sm text-slate-400">Manage your daily timeline and tasks.</p>
      </div>

      <div className="space-y-12">
        {/* Timeline */}
        <section>
          <TimeBlockingTimeline
            onOpenAddTask={onOpenAddTask}
            onSelectTask={onEditTask}
          />
        </section>

        {/* Task List */}
        <section>
          <TasksList
            onOpenAddTask={onOpenAddTask}
            onEditTask={onEditTask}
            onOpenBeatDetail={onOpenBeatDetail}
          />
        </section>
      </div>
    </div>
  );
};
