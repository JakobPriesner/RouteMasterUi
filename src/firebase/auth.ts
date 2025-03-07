import {
  browserSessionPersistence,
  browserLocalPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged as firebaseAuthStateChanged
} from 'firebase/auth';
import { firebaseAuth } from './firebaseConfig';

export interface AuthResult {
  success: boolean;
  user: FirebaseUser | null;
  error: string | null;
}

export const signInWithEmail = async (email: string, password: string, remember: boolean): Promise<AuthResult> => {
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence;

  try {
    await setPersistence(firebaseAuth, persistence);
    const result = await signInWithEmailAndPassword(firebaseAuth, email, password);

    return {
      success: true,
      user: result.user,
      error: null,
    };
  } catch (error: any) {
    return {
      success: false,
      user: null,
      error: error.message || 'An unknown error occurred',
    };
  }
};

export const firebaseSignOut = async (): Promise<{success: boolean, error?: string}> => {
  try {
    await signOut(firebaseAuth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error during sign out',
    };
  }
};

export const onAuthStateChanged = (callback: (user: FirebaseUser | null) => void) => {
  return firebaseAuthStateChanged(firebaseAuth, callback);
};