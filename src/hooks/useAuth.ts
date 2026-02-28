// Type guard for Firebase error objects
function isFirebaseError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}

function getFriendlyErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/email-already-in-use':
      return 'Email already registered';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-email':
      return 'Please enter a valid email address';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    default:
      return 'An error occurred. Please try again';
  }
}

import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  confirmPasswordReset as firebaseConfirmPasswordReset,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebaseApp';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => setState({ user, loading: false, error: null }),
      (error) => setState({ user: null, loading: false, error: error.message })
    );
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back! 👋');
      return result.user;
    } catch (error) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) message = getFriendlyErrorMessage(error.code);
      setState((prev) => ({ ...prev, error: message }));
      toast.error(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function signup(email: string, password: string, displayName: string) {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName });
        toast.success('Account created successfully! 🎉');
      }
      return result.user;
    } catch (error) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) message = getFriendlyErrorMessage(error.code);
      setState((prev) => ({ ...prev, error: message }));
      toast.error(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function logout() {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function loginWithGoogle() {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      toast.success('Signed in with Google!');
      return result.user;
    } catch (error) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) message = getFriendlyErrorMessage(error.code);
      setState((prev) => ({ ...prev, error: message }));
      toast.error(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }

  async function sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) message = getFriendlyErrorMessage(error.code);
      toast.error(message);
      throw error;
    }
  }

  async function confirmPasswordReset(oobCode: string, newPassword: string) {
    try {
      await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
      toast.success('Password reset successful!');
    } catch (error) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) message = getFriendlyErrorMessage(error.code);
      toast.error(message);
      throw error;
    }
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout,
    loginWithGoogle,
    sendPasswordReset,
    confirmPasswordReset,
    isAuthenticated: !!state.user,
  };
}