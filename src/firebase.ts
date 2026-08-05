import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

/**
 * Firebase initialization — CANCHAZO (project: canchazo-app)
 *
 * La config viene de variables VITE_* (ver .env / .env.example).
 * Si faltan, la app funciona igual en modo local/mock (isFirebaseConfigured = false).
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null

if (isFirebaseConfigured) {
  app = initializeApp(config as { apiKey: string; authDomain: string; projectId: string; storageBucket: string; messagingSenderId: string; appId: string })
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
}

export { app, auth, db, storage }
