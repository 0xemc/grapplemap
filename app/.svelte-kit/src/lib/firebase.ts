import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCaQA8BMWP98XGtb6P9AbMNmubbpR6csrA",
  authDomain: "fireship-fkit-111.firebaseapp.com",
  projectId: "fireship-fkit-111",
  storageBucket: "fireship-fkit-111.appspot.com",
  messagingSenderId: "150301131432",
  appId: "1:150301131432:web:c719f84b7ff4d1b96cf89d",
  measurementId: "G-Y0D5SPVRWR",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();
