// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCqal3ZlyEa0_CEu0CRmDNfkIRrZO7wfqE",
  authDomain: "sih-internal-4375c.firebaseapp.com",
  projectId: "sih-internal-4375c",
  storageBucket: "gs://sih-internal-4375c.appspot.com",
  messagingSenderId: "280772071093",
  appId: "1:280772071093:web:7bc692a37df30c672838fc",
  measurementId: "G-G52GSR8VC2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); 

export { auth };
