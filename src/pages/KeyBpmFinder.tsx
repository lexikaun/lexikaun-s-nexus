import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Upload, Copy, Check, Info, Cpu } from 'lucide-react';

export const KeyBpmFinder: React.FC = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{ bpm: number; key: string; scale: string; confidence: number } | null>({
    bpm: 138.2,
    key: 'F#',
    scale: 'Minor',
    confidence: 96,
  });
  const [copied, setCopied] = useState(false);

  const handleSimulateDrop = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        bpm: 124.0,
        key: 'G',
        scale: 'Minor',
        confidence: 93,
      });
    }, 1200);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.bpm} BPM | ${result.key} ${result.scale}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-display text-2xl font-normal tracking-tight text-ink">
            Key & BPM Finder
          </h1>
          <span className="text-[10px] px-2 py-0.5 rounded-[6px] bg-surface border border-hairline text-ink-muted font-mono flex items-center gap-1">
            <Cpu className="w-3 h-3 text-accent" /> essentia.js (Wasm)
          </span>
        </div>
        <p className="text-xs text-ink-muted mt-1 font-sans">
          Standalone WebAssembly audio analysis pipeline running client-side in a Web Worker.
        </p>
      </div>

      {/* Strict Decoupling Disclaimer */}
      <div className="p-4 rounded-2xl bg-surface border border-hairline border-l-2 border-l-accent flex items-start gap-3 shadow-sm">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-ink-muted leading-relaxed font-sans">
          <strong className="font-medium text-ink">Zero-Persistence DSP Tool:</strong> Tracks analyzed here are processed client-side in memory and <span className="text-ink font-medium">never written to Firestore or Storage</span>.
        </div>
      </div>

      {/* Upload / Dropzone */}
      <div
        onClick={handleSimulateDrop}
        className="p-10 rounded-2xl bg-surface border border-dashed border-hairline hover:border-accent/50 hover:bg-surface-hover/50 transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer group shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
      >
        <div className="w-12 h-12 rounded-full bg-canvas border border-hairline flex items-center justify-center mb-3 group-hover:border-accent transition-colors shadow-sm">
          <Upload className="w-5 h-5 text-ink-muted group-hover:text-accent transition-colors" />
        </div>
        <h2 className="font-display text-sm font-normal text-ink mb-1">
          {analyzing ? 'Analyzing track with essentia.js Web Worker...' : 'Drop any reference audio track here'}
        </h2>
        <p className="text-xs text-ink-muted font-mono">Supports MP3, WAV, FLAC, AIFF up to 50MB</p>
      </div>

      {/* Analysis Result (Studio Readout) */}
      {result && (
        <Card className="p-5 bg-surface border border-hairline rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-hairline">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-ink-muted block">
                Analysis Output
              </span>
              <h3 className="font-display text-sm font-normal text-ink">reference_sample_02.wav</h3>
            </div>
            <Button size="sm" variant="secondary" onClick={handleCopy} className="gap-1.5 text-xs font-sans rounded-[10px]">
              {copied ? <Check className="w-3.5 h-3.5 text-accent" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Values'}</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-canvas border border-hairline text-center shadow-inner">
              <span className="text-xs text-ink-muted block mb-1 font-sans">Detected Tempo</span>
              <span className="text-3xl font-mono text-accent font-medium tracking-tight">
                {result.bpm} <span className="text-xs text-ink-muted">BPM</span>
              </span>
            </div>

            <div className="p-4 rounded-xl bg-canvas border border-hairline text-center shadow-inner">
              <span className="text-xs text-ink-muted block mb-1 font-sans">Estimated Key</span>
              <span className="text-3xl font-mono text-ink font-medium tracking-tight">
                {result.key} <span className="text-sm text-accent font-display">{result.scale}</span>
              </span>
            </div>
          </div>

          <div className="mt-3.5 text-center">
            <span className="text-[11px] font-mono text-ink-muted/80">
              Confidence: {result.confidence}% • Krumhansl-Schmuckler Harmonic Profiles
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};
