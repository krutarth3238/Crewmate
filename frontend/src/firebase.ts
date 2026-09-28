/**
 * Firebase client SDK initialization.
 * All config values come from VITE_ env vars (set in frontend/.env).
 * This file should NEVER import from firebase-admin — that is backend-only.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Prevent re-initialization on hot-reload
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/** Trigger Google OAuth popup and return the signed-in User */
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/** Sign out the current user */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function signInWithEmail(email: string, pass: string): Promise<User> {
  const result = await firebaseSignInWithEmailAndPassword(auth, email, pass);
  return result.user;
}

export async function signUpWithEmail(email: string, pass: string): Promise<User> {
  const result = await firebaseCreateUserWithEmailAndPassword(auth, email, pass);
  return result.user;
}

/** Subscribe to Firebase auth state changes (pre-bound to this app's auth instance).
 *  Returns the unsubscribe function — safe to return directly from a React useEffect. */
export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export type { User };

