import React, { useState } from 'react';
import { X, User, LogIn, LogOut, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAnonymouslyUser,
    logout,
    resetUserToDefaults,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnon = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInAnonymouslyUser();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Guest sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div
        id="modal-auth"
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#1E2430] bg-[#0F1218] p-6 shadow-2xl transition-all"
      >
        <div className="flex items-center justify-between border-b border-[#1E2430] pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <User className="h-4 w-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-100">
              {user ? 'Account Profile' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#141820] hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {user ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-[#1E2430] bg-[#141820] p-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-lg font-bold text-black">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="font-bold text-slate-100">
                    {user.displayName || 'Producer'}
                  </div>
                  <div className="text-xs text-slate-400">{user.email || (user.isAnonymous ? 'Guest Producer Account' : 'Authenticated User')}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#1E2430] pt-4">
              <button
                onClick={async () => {
                  if (window.confirm('Reset sample dataset?')) {
                    await resetUserToDefaults();
                    onClose();
                  }
                }}
                className="flex items-center space-x-1.5 rounded-xl border border-[#1E2430] bg-[#141820] px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Sample Data</span>
              </button>

              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3.5">
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-2.5 text-xs text-rose-300">
                {errorMsg}
              </div>
            )}

            {/* Google Sign-in as Primary Option */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2.5 rounded-xl border border-slate-700 bg-white py-2.5 text-xs font-bold text-slate-900 shadow-md hover:bg-slate-100 disabled:opacity-50 transition"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#1E2430]" />
              </div>
              <span className="relative bg-[#0F1218] px-2 text-[10px] uppercase font-bold text-slate-500">
                Or with Email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Producer / Artist Name"
                    className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-[#1E2430] bg-[#0A0C10] px-3.5 py-2 text-xs text-slate-100 outline-none focus:border-emerald-500/60"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center space-x-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-black shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:opacity-50"
              >
                <LogIn className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              </button>
            </form>

            <button
              type="button"
              onClick={handleAnon}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-1.5 rounded-xl border border-[#1E2430] bg-[#141820] py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:text-slate-100"
            >
              <span>Instant Guest Mode</span>
            </button>

            <div className="pt-2 text-center text-xs text-slate-400">
              {mode === 'signin' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Sign Up
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="font-bold text-emerald-400 hover:underline"
                  >
                    Sign In
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
