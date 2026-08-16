import React from 'react';
import { usePlanner } from '../../context/PlannerContext';
import { useAuth } from '../../context/AuthContext';
import { Play, Check, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';

interface DashboardProps {
  onOpenAddTask: () => void;
  onOpenReschedule: (task: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAddTask, onOpenReschedule }) => {
  const { user } = useAuth();
  const {
    goals,
    currentTask,
    nextTask,
    currentSlotRemainingMinutes,
    dailyProgressPercentage,
    setTaskStatus,
  } = usePlanner();

  const { getBeatById, playBeat } = useMusic();

  const activeBeat = currentTask?.associatedBeatId
    ? getBeatById(currentTask.associatedBeatId)
    : null;

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="mx-auto max-w-4xl space-y-12 pb-24">
      {/* Greeting */}
      <div className="space-y-1">
        <h1 className="text-3xl font-light tracking-tight text-slate-100">
          Good morning, <span className="font-semibold text-emerald-400">{user?.displayName?.split(' ')[0] || 'Producer'}</span>
        </h1>
        <p className="text-sm text-slate-400">{dateString}</p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-slate-400">Daily Progress</span>
          <span className="text-emerald-400">{dailyProgressPercentage}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-[#18181b]">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: `${dailyProgressPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        {/* Left Column: Focus & Current Task */}
        <div className="space-y-12">
          
          {/* Today's Focus */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Today's Focus</h2>
            {goals.length > 0 ? (
              <div className="space-y-3">
                {goals.slice(0, 3).map((goal, idx) => (
                  <div key={goal.id} className="flex items-start space-x-3">
                    <span className="mt-0.5 text-xs font-mono text-slate-500">{idx + 1}.</span>
                    <span className="text-slate-200">{goal.title}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">No specific goals set for today.</p>
            )}
          </section>

          {/* Currently */}
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-500/70">Currently</h2>
            
            {currentTask ? (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-2xl">
                <h3 className="text-2xl font-semibold tracking-tight text-slate-100">{currentTask.title}</h3>
                
                <div className="mt-4 flex items-center space-x-3 text-sm text-slate-400">
                  <Clock className="h-4 w-4" />
                  <span>{currentTask.startTime} — {currentTask.endTime}</span>
                  {currentSlotRemainingMinutes !== null && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-emerald-400">{currentSlotRemainingMinutes}m remaining</span>
                    </>
                  )}
                </div>

                {activeBeat && (
                  <div className="mt-6 flex items-center space-x-3">
                    <button
                      onClick={() => playBeat(activeBeat)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-black hover:scale-105 transition-transform"
                    >
                      <Play className="ml-1 h-4 w-4 fill-black" />
                    </button>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{activeBeat.title}</div>
                      <div className="text-xs text-slate-500">Associated Beat</div>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center space-x-3">
                  <button
                    onClick={() => setTaskStatus(currentTask.id, 'completed')}
                    className="flex items-center space-x-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-emerald-400"
                  >
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Complete</span>
                  </button>
                  <button
                    onClick={() => onOpenReschedule(currentTask)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-[#18181b] hover:text-slate-200"
                  >
                    Reschedule
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#27272a] bg-[#121214] p-6 text-slate-400">
                <p>No active scheduled task.</p>
                <button
                  onClick={onOpenAddTask}
                  className="mt-4 text-sm font-medium text-emerald-400 hover:text-emerald-300"
                >
                  + Schedule something now
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Upcoming */}
        <div className="space-y-12">
          <section className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Upcoming</h2>
            {nextTask ? (
              <div className="space-y-4 border-l-2 border-[#27272a] pl-4">
                <div>
                  <h3 className="font-medium text-slate-200">{nextTask.title}</h3>
                  <div className="mt-1 flex items-center space-x-2 text-sm text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{nextTask.startTime} — {nextTask.endTime}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3 text-slate-500">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm">Your schedule is clear.</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
