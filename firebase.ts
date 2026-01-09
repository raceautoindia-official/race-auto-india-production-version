// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA49NwZ5_XbWEA-96DQXN21BREbeSFdmEg",
  authDomain: "otp-auth-864b3.firebaseapp.com",
  projectId: "otp-auth-864b3",
  storageBucket: "otp-auth-864b3.firebasestorage.app",
  messagingSenderId: "808922538557",
  appId: "1:808922538557:web:59c20b4be05f1f9bbd8054",
  measurementId: "G-CQ0DRSRZF7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
