import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: "AIzaSyAnApXVVxEKfB48mBLUazOHHtevBEaTqxk",
  authDomain: "aigrid-23256.firebaseapp.com",
  databaseURL:
    "https://aigrid-23256-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "aigrid-23256",
  storageBucket: "aigrid-23256.firebasestorage.app",
  messagingSenderId: "731240201745",
  appId: "1:731240201745:web:66b3f54396050405ec3bb0",
  measurementId: "G-NNK84XVZ4F",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);