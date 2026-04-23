import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { createFirebaseBackend, setBackend } from "@workspace/api-client-react";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

for (const [key, value] of Object.entries(config)) {
  if (!value) {
    throw new Error(
      `Missing Firebase env var: VITE_FIREBASE_${key.replace(/([A-Z])/g, "_$1").toUpperCase()}`,
    );
  }
}

const app = getApps()[0] ?? initializeApp(config);
export const db = getFirestore(app);

setBackend(createFirebaseBackend(db));
