// Type guard for Firebase error objects
function isFirebaseError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  );
}
import { useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import toast from 'react-hot-toast'; // We'll install this later

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setState({ user, loading: false, error: null });
      },
      (error) => {
        console.error('Auth state change error:', error);
        setState({ user: null, loading: false, error: error.message });
      }
    );

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back! 👋');
      return result.user;
    } catch (error: unknown) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) {
        message = getFriendlyErrorMessage(error.code);
      }
      setState((prev) => ({ ...prev, error: message }));
      toast.error(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (result.user) {
        await updateProfile(result.user, { displayName });
        toast.success('Account created successfully! 🎉');
      }
      
      return result.user;
    } catch (error: unknown) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) {
        message = getFriendlyErrorMessage(error.code);
      }
      setState((prev) => ({ ...prev, error: message }));
      toast.error(message);
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error: unknown) {
      toast.error('Failed to log out');
      throw error;
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: unknown) {
      let message = 'An error occurred.';
      if (isFirebaseError(error)) {
        message = getFriendlyErrorMessage(error.code);
      }
      toast.error(message);
      throw error;
    }
  };

  // Helper to show user-friendly error messages
  const getFriendlyErrorMessage = (errorCode: string): string => {
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
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    logout,
    resetPassword,
    isAuthenticated: !!state.user,
  };
};