
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, enableNetwork, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";
import { config } from 'dotenv';

config(); 

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface FirebaseServices {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

let firebaseServices: FirebaseServices | null = null;

function initializeFirebase(): FirebaseServices {
  if (firebaseServices) {
    return firebaseServices;
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const db = getFirestore(app);
  const auth = getAuth(app);

  try {
    enableNetwork(db);
    console.log('✅ Firestore online');
  } catch (err) {
    console.error('❌ Firestore enableNetwork failed', err);
  }

  firebaseServices = { app, db, auth };
  return firebaseServices;
}

const { app, db, auth } = initializeFirebase();

export { app, db, auth };
