import React, { createContext, useContext, useEffect, useState } from 'react';
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
import { initUserData } from '../services/db';

interface AuthContextType {
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

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        try {
          await initUserData(fbUser.uid);
        } catch (e) {
          console.warn('Error initializing user data:', e);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
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
        await initUserData(cred.user.uid);
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      throw err;
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
        await initUserData(cred.user.uid);
      }
    } catch (err) {
      console.error('Email sign in error:', err);
      throw err;
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
        await initUserData(cred.user.uid);
      }
    } catch (err) {
      console.error('Sign up error:', err);
      throw err;
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
        await initUserData(cred.user.uid);
      }
    } catch (err) {
      console.error('Anonymous sign in error:', err);
      throw err;
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const resetUserToDefaults = async () => {
    if (user) {
      localStorage.removeItem(`lifebeatos_seeded_${user.uid}`);
      await initUserData(user.uid);
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
