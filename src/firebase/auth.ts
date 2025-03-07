import {browserSessionPersistence, browserLocalPersistence, setPersistence, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import {firebaseAuth} from './firebaseConfig';

export const signInWithEmail = async (email: string, password: string, remember: boolean) => {
  const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
  return setPersistence(firebaseAuth, persistence).then(async () => {
    try {
      const result = await signInWithEmailAndPassword(firebaseAuth, email, password);

      return {
        success: true,
        user: result.user,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        user: null,
        error: error.message,
      };
    }
  });
};

export const firebaseSignOut = async () => {
  try {
    await signOut(firebaseAuth);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return firebaseAuth.onAuthStateChanged(callback);
};
