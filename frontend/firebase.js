// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "zest-e473f.firebaseapp.com",
  projectId: "zest-e473f",
  storageBucket: "zest-e473f.firebasestorage.app",
  messagingSenderId: "488277444446",
  appId: "1:488277444446:web:fc72a23cbe922c1e85f1cf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export { app, auth }