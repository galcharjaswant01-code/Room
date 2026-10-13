import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBBUIpSeo5pB8RMQqWFr7e17OY3K9E-DQA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "romm-8f6d2.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "romm-8f6d2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "romm-8f6d2.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "490984815029",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:490984815029:web:23200166f3513f76ab01fc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';
