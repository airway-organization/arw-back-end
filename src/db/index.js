//connection with firebase database
import dotenv from "dotenv";
dotenv.config({
  path: "./env",
});
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
var firebaseApp;
let connectDB = new Promise(function (myResolve, myReject) {
  try {
    firebaseApp = initializeApp(firebaseConfig);
    myResolve();
  } catch (error) {
    myReject(error);
  }
});

const db = getFirestore(firebaseApp);

export { db, connectDB, firebaseApp };
