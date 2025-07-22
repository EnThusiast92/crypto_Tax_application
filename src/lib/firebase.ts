
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, enableNetwork, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration, directly from your console
const firebaseConfig = {
  apiKey: "AIzaSyBJSapORSs7ULz9rsExA7s8xUIzjUO_iXw",
  authDomain: "cryptotaxapp-21586.firebaseapp.com",
  projectId: "cryptotaxapp-21586",
  storageBucket: "cryptotaxapp-21586.firebasestorage.app",
  messagingSenderId: "296139586728",
  appId: "1:296139586728:web:288ab5819d2aae474b169d",
  measurementId: "G-LZ5F7CGQGX"
};

// Initialize Firebase for client-side
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);
const auth: Auth = getAuth(app);

try {
  enableNetwork(db);
  console.log('✅ Firestore online');
} catch (err) {
  console.error('❌ Firestore enableNetwork failed', err);
}

export { app, db, auth };
