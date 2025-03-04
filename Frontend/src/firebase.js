// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD2k0DQCZxosiwHYsDAVPN6ZF57SguyHDc",
  authDomain: "data-tails.firebaseapp.com",
  projectId: "data-tails",
  storageBucket: "data-tails.firebasestorage.app",
  messagingSenderId: "790602042259",
  appId: "1:790602042259:web:60c1ae2b5b7927dab8b666",
  measurementId: "G-DBXEPD5QX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
