import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase';

/**
 * Google sign-in + first-run profile provisioning.
 *
 * On first sign-in a `users/{uid}` document is created with role 'player'.
 * The owner role is granted later by an existing owner (or by bootstrap), so
 * a brand-new account can never self-promote.
 */
export async function signInWithGoogle(): Promise<User> {
  if (!isFirebaseConfigured || !auth || !db) {
    throw new Error('La autenticación requiere Firebase configurado.');
  }
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function ensureUserProfile(user: User): Promise<void> {
  if (!db) return;
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      role: 'player',
      email: user.email ?? '',
      displayName: user.displayName ?? '',
      photoURL: user.photoURL ?? '',
      createdAt: new Date().toISOString(),
    });
  }
}
