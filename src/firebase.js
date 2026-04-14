import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAM84qaUIi9CKThmqugLTzxfU4LcmaZ_8g",
    authDomain: "gracehub-25d09.firebaseapp.com",
    projectId: "gracehub-25d09",
    storageBucket: "gracehub-25d09.firebasestorage.app",
    messagingSenderId: "166162068077",
    appId: "1:166162068077:web:4b8b0b794b9cc316cb0564"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();