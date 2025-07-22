
'use client';

import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJSapORSs7ULz9rsExA7s8xUIzjUO_iXw",
  authDomain: "cryptotaxapp-21586.firebaseapp.com",
  projectId: "cryptotaxapp-21586",
  // storageBucket: "cryptotaxapp-21586.firebasestorage.app", // REMOVED - Requires billing plan
  messagingSenderId: "296139586728",
  appId: "1:296139586728:web:288ab5819d2aae474b169d",
  measurementId: "G-LZ5F7CGQGX"
};

// Initialize Firebase for SSR
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db };
