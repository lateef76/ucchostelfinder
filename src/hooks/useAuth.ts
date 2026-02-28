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
import type { User as FirebaseUser } from 'firebase/auth';
import { userService } from '../lib/firebase';
import type { User as AppUser, UserRole } from '../types';
import { auth } from '../lib/firebaseApp';
import toast from 'react-hot-toast';

interface AuthState {
  firebaseUser: FirebaseUser | null;
  user: AppUser | null;
  loading: boolean;
  error: string | null;
}


export function useAuth() {
  const [state, setState] = useState<AuthState>({
    firebaseUser: null,
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch user profile from Firestore
          const profile = await userService.getUserProfile(firebaseUser.uid);
          setState({ firebaseUser, user: profile, loading: false, error: null });
        } else {
          setState({ firebaseUser: null, user: null, loading: false, error: null });
        }
      },
      (error) => setState({ firebaseUser: null, user: null, loading: false, error: error.message })
    );
    return unsubscribe;
  }, []);

  async function login(email: string, password: string) {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await signInWithEmailAndPassword(auth, email, password);
      // Fetch user profile from Firestore
      const profile = await userService.getUserProfile(result.user.uid);
      setState((prev) => ({ ...prev, firebaseUser: result.user, user: profile, loading: false }));
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

  async function signup(email: string, password: string, displayName: string, role: UserRole) {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (result.user) {
        await updateProfile(result.user, { displayName });
        // Save user profile with role in Firestore
        await userService.setUserProfile(result.user.uid, {
          id: result.user.uid,
          email,
          name: displayName,
          role: role as import("../types").UserRole,
          createdAt: new Date(),
          lastLogin: new Date(),
          favoriteCount: 0,
          reviewCount: 0,
          settings: {
            notifications: {
              email: true,
              push: true,
              reviews: true,
              favorites: true,
            },
            privacy: {
              showProfile: true,
              showReviews: true,
              showFavorites: true,
            },
            theme: 'light',
          },
        });
        // Fetch user profile after creation
        const profile = await userService.getUserProfile(result.user.uid);
        setState((prev) => ({ ...prev, firebaseUser: result.user, user: profile, loading: false }));
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
    firebaseUser: state.firebaseUser,
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