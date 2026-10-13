import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAAuuA8BRzH6O94fo-cXYdd0CT61q7dLsM",
  authDomain: "room-booking-5d4be.firebaseapp.com",
  projectId: "room-booking-5d4be",
  storageBucket: "room-booking-5d4be.firebasestorage.app",
  messagingSenderId: "280129714049",
  appId: "1:280129714049:web:7b59712b7cfa3183125a80",
  measurementId: "G-S3V112ENMC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider, signInWithPopup };
