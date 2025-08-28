// js/firebase-config.js
// Import fungsi-fungsi yang dibutuhkan dari Firebase SDK v9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-storage.js";

// Konfigurasi Firebase Anda dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDxOGzerbdJXnUO93i7wjIWUYpeICu9kyw",
  authDomain: "elevenfourgengs.firebaseapp.com",
  projectId: "elevenfourgengs",
  storageBucket: "elevenfourgengs.firebasestorage.app",
  messagingSenderId: "322756405034",
  appId: "1:322756405034:web:a42662d8dcd420a91d2053",
  measurementId: "G-E6YJZP6BPX"
};

// Inisialisasi Firebase App
const app = initializeApp(firebaseConfig);

// Mendapatkan referensi ke layanan Firebase yang kita butuhkan
// Dan mengekspornya agar bisa diimpor di file lain
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
