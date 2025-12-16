// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdPpLeLIlUVZxu7qqa01dFbV6-UUewewY",
  authDomain: "big-structure-477622-i1.firebaseapp.com",
  projectId: "big-structure-477622-i1",
  storageBucket: "big-structure-477622-i1.firebasestorage.app",
  messagingSenderId: "750515589783",
  appId: "1:750515589783:web:0b198eab776b1bf8d6cfd2",
  measurementId: "G-K2ZC75Q751"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// connected auth with firebase project
const auth = getAuth(app)

// connected firestore with firebase project
const fireStore = getFirestore(app)

// connected getStorage with firebase project
const storage = getStorage(app)




export default {app , auth , fireStore , storage }

