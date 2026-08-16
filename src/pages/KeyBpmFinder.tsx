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
    confidence: 96
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
        confidence: 93
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
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium tracking-tight text-text-main">Key & BPM Finder</h1>
          <span className="text-[10px] px-2 py-0.5 rounded bg-surface hairline-border text-text-secondary font-mono flex items-center gap-1">
            <Cpu className="w-3 h-3 text-music-accent" /> essentia.js (Wasm)
          </span>
        </div>
        <p className="text-xs text-text-secondary mt-1">
          Standalone WebAssembly audio analysis in a client Web Worker.
        </p>
      </div>

      {/* Strict Decoupling Disclaimer */}
      <div className="p-3.5 rounded-lg bg-surface hairline-border border-l-2 border-l-music-accent flex items-start gap-3">
        <Info className="w-4 h-4 text-music-accent shrink-0 mt-0.5" />
        <div className="text-xs text-text-secondary leading-relaxed">
          <strong className="font-medium text-text-main">Zero-Persistence Tool:</strong> Tracks analyzed here are decoded client-side in memory and <span className="text-text-main">never written to Firestore or Storage</span>. Results do not link to Beats or Playlists.
        </div>
      </div>

      {/* Upload / Dropzone */}
      <div
        onClick={handleSimulateDrop}
        className="p-10 rounded-xl bg-surface hairline-border border-dashed border-border-main hover:border-music-accent/50 transition-all flex flex-col items-center justify-center text-center cursor-pointer group"
      >
        <div className="w-12 h-12 rounded-full bg-bg-main hairline-border flex items-center justify-center mb-3 group-hover:border-music-accent transition-colors">
          <Upload className="w-5 h-5 text-text-secondary group-hover:text-music-accent transition-colors" />
        </div>
        <h2 className="text-sm font-normal text-text-main mb-1">
          {analyzing ? 'Analyzing track in Web Worker...' : 'Drop any reference audio file here'}
        </h2>
        <p className="text-xs text-text-secondary">Supports MP3, WAV, FLAC, AIFF up to 50MB</p>
      </div>

      {/* Analysis Result (Studio Readout) */}
      {result && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-main">
            <div>
              <span className="text-xs uppercase tracking-wider text-text-secondary font-medium block">
                Analysis Output
              </span>
              <h3 className="text-sm font-normal text-text-main">reference_sample_02.wav</h3>
            </div>
            <Button size="sm" variant="secondary" onClick={handleCopy} className="gap-1.5 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 text-text-main" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Values'}</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-bg-main hairline-border text-center">
              <span className="text-xs text-text-secondary block mb-1">Detected Tempo</span>
              <span className="text-2xl font-mono text-music-accent font-medium">
                {result.bpm} <span className="text-xs text-text-secondary">BPM</span>
              </span>
            </div>

            <div className="p-4 rounded-lg bg-bg-main hairline-border text-center">
              <span className="text-xs text-text-secondary block mb-1">Estimated Key</span>
              <span className="text-2xl font-mono text-text-main font-medium">
                {result.key} <span className="text-sm text-text-secondary font-sans">{result.scale}</span>
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs text-text-secondary">
              Algorithm Confidence: {result.confidence}% (Harmonic Key Profile + Tempo Autocorrelation)
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};
