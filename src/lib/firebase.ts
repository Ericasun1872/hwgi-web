import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/** Public web client config (same as Flutter web). Safe to ship in browser. */
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBb_tP3KQzlhO6TMH7fQsRJ6T9GZD4r3yc",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "writerapp-3a1b3.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "writerapp-3a1b3",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "writerapp-3a1b3.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "968253480596",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:968253480596:web:eab9ac868e87013c339e81",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-50N40TZD5M",
};

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApps()[0]!;
  return initializeApp(firebaseConfig);
}

let db: Firestore | null = null;
let auth: Auth | null = null;

export function getDb(): Firestore {
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

export function getClientAuth(): Auth {
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}
