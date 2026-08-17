import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RotateCcw, Copy, Check } from 'lucide-react';

export const TapTempo: React.FC = () => {
  const [bpm, setBpm] = useState<number | null>(null);
  const [tapCount, setTapCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const tapTimesRef = useRef<number[]>([]);
  const timeoutRef = useRef<number | null>(null);

  const handleTap = () => {
    const now = performance.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Reset if gap > 2 seconds
    if (tapTimesRef.current.length > 0 && now - tapTimesRef.current[tapTimesRef.current.length - 1] > 2000) {
      tapTimesRef.current = [];
    }

    tapTimesRef.current.push(now);

    if (tapTimesRef.current.length > 8) {
      tapTimesRef.current.shift();
    }

    setTapCount(tapTimesRef.current.length);

    if (tapTimesRef.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < tapTimesRef.current.length; i++) {
        intervals.push(tapTimesRef.current[i] - tapTimesRef.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      setBpm(calculatedBpm);
    }

    timeoutRef.current = window.setTimeout(() => {
      tapTimesRef.current = [];
    }, 3000);
  };

  const handleReset = () => {
    tapTimesRef.current = [];
    setBpm(null);
    setTapCount(0);
  };

  const handleCopy = () => {
    if (!bpm) return;
    navigator.clipboard.writeText(`${bpm}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-normal tracking-tight text-ink">Tap Tempo</h1>
        <p className="text-xs text-ink-muted mt-1 font-sans">
          Manual tempo detection assist. Tap in rhythm with your mouse or spacebar.
        </p>
      </div>

      {/* BPM Readout */}
      <Card className="p-6 bg-surface border border-hairline rounded-2xl shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
        <div className="text-[10px] uppercase font-mono tracking-wider text-ink-muted mb-1">
          Calculated Tempo
        </div>
        <div className="text-5xl font-mono text-accent font-medium my-3 tracking-tight">
          {bpm ? bpm : '---'}{' '}
          <span className="text-sm text-ink-muted font-mono font-normal">BPM</span>
        </div>
        <div className="text-xs font-mono text-ink-muted">
          {tapCount > 1 ? `Based on ${tapCount} taps` : 'Tap at least twice to calculate'}
        </div>
      </Card>

      {/* Interactive Tap Button */}
      <button
        onClick={handleTap}
        className="w-full h-36 rounded-2xl bg-surface border border-hairline hover:border-accent/60 hover:bg-surface-hover active:scale-[0.98] transition-all duration-150 flex flex-col items-center justify-center cursor-pointer shadow-[0_12px_32px_rgba(0,0,0,0.35)] group select-none"
      >
        <span className="font-display text-base font-medium text-ink group-hover:text-accent transition-colors">
          TAP IN TEMPO
        </span>
        <span className="text-xs font-mono text-ink-muted mt-1">Keep a steady beat</span>
      </button>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="secondary" size="sm" onClick={handleReset} className="gap-1.5 text-xs font-sans rounded-[10px]">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>
        {bpm && (
          <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1.5 text-xs font-sans rounded-[10px]">
            {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy BPM'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
