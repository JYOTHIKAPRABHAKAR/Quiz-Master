import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

const signUp = (email: string, password: string): Promise<User> => {
  return createUserWithEmailAndPassword(auth, email, password).then(
    (userCredential) => userCredential.user
  );
};

const signIn = (email: string, password: string): Promise<User> => {
  return signInWithEmailAndPassword(auth, email, password).then(
    (userCredential) => userCredential.user
  );
};

const signOutUser = (): Promise<void> => {
  return signOut(auth);
};

export { auth, signUp, signIn, signOutUser, onAuthStateChanged };
