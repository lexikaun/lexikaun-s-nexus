import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { Music, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInGuest } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError('');
    setLoading(true);
    try {
      await signInGuest();
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Guest sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-bg-main p-6 text-text-main select-none">
      <div className="w-full max-w-md bg-surface hairline-border rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle accent header line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-red-main" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-lg bg-bg-main hairline-border flex items-center justify-center mb-3">
            <span className="text-xl font-medium tracking-tighter text-text-main">LX</span>
          </div>
          <h1 className="text-xl font-medium tracking-tight text-text-main">LEXIKAUN</h1>
          <p className="text-xs text-text-secondary mt-1">Personal Planner & Music Production Studio</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-main/10 border border-red-main/20 text-red-main text-xs">
            {error}
          </div>
        )}

        {/* Quick Demo / Guest Access */}
        <button
          onClick={handleGuest}
          disabled={loading}
          className="w-full py-3 px-4 rounded-lg bg-bg-main hairline-border hover:bg-surface text-text-main text-sm font-medium flex items-center justify-between transition-all group mb-6 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-red-main" />
            <span>Instant Preview (Guest Mode)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-text-secondary group-hover:translate-x-0.5 transition-transform" />
        </button>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-border-main" />
          <span className="text-[11px] uppercase tracking-wider text-text-secondary">or sign in</span>
          <div className="flex-1 h-px bg-border-main" />
        </div>

        {/* Standard Email Auth */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <Input
              label="Name"
              placeholder="Producer / Lexikaun"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={loading}
          >
            {isSignUp ? 'Create Account' : 'Enter Workspace'}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="hover:text-text-main transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
          
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="hover:text-text-main transition-colors cursor-pointer"
          >
            Google Sign-in
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-border-main flex items-center justify-center gap-2 text-[11px] text-text-secondary">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Single-user isolated deployment</span>
        </div>
      </div>
    </div>
  );
};
