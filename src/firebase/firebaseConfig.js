import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
   apiKey: "AIzaSyCTOr59ADcci6eml9mDXYMNIkiGc9M5J7k",
  authDomain: "fleet-automata-440108-h8.firebaseapp.com",
  projectId: "fleet-automata-440108-h8",
  storageBucket: "fleet-automata-440108-h8.firebasestorage.app",
  messagingSenderId: "534861695296",
  appId: "1:534861695296:web:4d457f39a2a5c4987052a5",
  measurementId: "G-VCG81DJWDP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;