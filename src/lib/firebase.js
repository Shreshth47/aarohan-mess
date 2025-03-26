// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAAw_HXUe_4Q3cZEElbe3As1MUeM-hmZDk",
  authDomain: "aarohan-25.firebaseapp.com",
  projectId: "aarohan-25",
  storageBucket: "aarohan-25.firebasestorage.app",
  messagingSenderId: "340319344807",
  appId: "1:340319344807:web:c8715956d5ae91dfcde382",
  measurementId: "G-SS6T5PQS7K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services for use in other parts of the app
export { app, auth, db, storage };
