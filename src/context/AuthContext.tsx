import React, { createContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { UserProfile } from '../types';

export interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string, name: string) => Promise<void>;
  signInAnonymouslyUser: () => Promise<void>;
  signInGuest: () => Promise<void>;
  logout: () => Promise<void>;
  signOut: () => Promise<void>;
  resetUserToDefaults: () => Promise<void>;
}

const defaultProfile: UserProfile = {
  uid: 'local-producer-01',
  email: 'producer@lexikaun.local',
  displayName: 'Producer',
  photoURL: null,
  isAnonymous: false,
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(defaultProfile);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Producer'),
            photoURL: fbUser.photoURL,
            isAnonymous: fbUser.isAnonymous,
          };
          setFirebaseUser(fbUser);
          setUser(profile);
        } else {
          setFirebaseUser(null);
          setUser(defaultProfile);
        }
        setLoading(false);
      }, (error) => {
        console.warn('Firebase auth state warning (using local fallback):', error);
        setUser(defaultProfile);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Firebase auth init error (using local fallback):', err);
      setUser(defaultProfile);
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || (cred.user.email ? cred.user.email.split('@')[0] : 'Producer'),
          photoURL: cred.user.photoURL,
          isAnonymous: cred.user.isAnonymous,
        };
        setFirebaseUser(cred.user);
        setUser(profile);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || email.split('@')[0],
          photoURL: cred.user.photoURL,
          isAnonymous: cred.user.isAnonymous,
        };
        setFirebaseUser(cred.user);
        setUser(profile);
      }
    } catch (err) {
      console.error('Email sign in error:', err);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        if (name) {
          try {
            await updateProfile(cred.user, { displayName: name });
          } catch {}
        }
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name || email.split('@')[0],
          photoURL: null,
          isAnonymous: cred.user.isAnonymous,
        };
        setFirebaseUser(cred.user);
        setUser(profile);
      }
    } catch (err) {
      console.error('Sign up error:', err);
    }
  };

  const signInAnonymouslyUser = async () => {
    try {
      const cred = await signInAnonymously(auth);
      if (cred.user) {
        const profile: UserProfile = {
          uid: cred.user.uid,
          email: null,
          displayName: 'Guest Producer',
          photoURL: null,
          isAnonymous: true,
        };
        setFirebaseUser(cred.user);
        setUser(profile);
      }
    } catch (err) {
      console.error('Anonymous sign in error:', err);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {}
    setUser(defaultProfile);
    setFirebaseUser(null);
  };

  const resetUserToDefaults = async () => {
    setUser(defaultProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInAnonymouslyUser,
        signInGuest: signInAnonymouslyUser,
        logout: signOut,
        signOut,
        resetUserToDefaults,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { useAuth } from './useAuth';
