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
        <h1 className="text-xl font-medium tracking-tight text-text-main">Tap Tempo</h1>
        <p className="text-xs text-text-secondary mt-1">
          Manual tempo detection assist. Tap in rhythm with mouse click.
        </p>
      </div>

      {/* BPM Readout */}
      <Card className="p-6">
        <div className="text-xs uppercase tracking-wider text-text-secondary font-medium mb-1">
          Calculated Tempo
        </div>
        <div className="text-4xl font-mono text-music-accent font-medium my-3">
          {bpm ? bpm : '---'}{' '}
          <span className="text-xs text-text-secondary font-mono font-normal">BPM</span>
        </div>
        <div className="text-xs text-text-secondary">
          {tapCount > 1 ? `Based on ${tapCount} taps` : 'Tap at least twice to calculate'}
        </div>
      </Card>

      {/* Interactive Tap Button */}
      <button
        onClick={handleTap}
        className="w-full h-32 rounded-xl bg-surface hairline-border hover:border-music-accent/50 active:scale-[0.98] transition-all flex flex-col items-center justify-center cursor-pointer shadow-sm group select-none"
      >
        <span className="text-sm font-normal text-text-main group-hover:text-music-accent transition-colors">
          TAP HERE IN TEMPO
        </span>
        <span className="text-xs text-text-secondary mt-1">Keep a steady beat</span>
      </button>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button variant="secondary" size="sm" onClick={handleReset} className="gap-1.5 text-xs">
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>
        {bpm && (
          <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1.5 text-xs">
            {copied ? <Check className="w-3.5 h-3.5 text-text-main" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy BPM'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
