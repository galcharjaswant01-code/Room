import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAAuuA8BRzH6O94fo-cXYdd0CT61q7dLsM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "room-booking-5d4be.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "room-booking-5d4be",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "room-booking-5d4be.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "280129714049",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:280129714049:web:7b59712b7cfa3183125a80"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } from 'firebase/auth';
