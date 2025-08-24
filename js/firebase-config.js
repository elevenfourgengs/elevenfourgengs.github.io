    // firebase-config.js
    // Konfigurasi Firebase Anda dari Firebase Console
    var firebaseConfig = {
      apiKey: "AIzaSyDxOGzerbdJXnUO93i7wjIWUYpeICu9kyw",
      authDomain: "elevenfourgengs.firebaseapp.com",
      projectId: "elevenfourgengs",
      storageBucket: "elevenfourgengs.firebasestorage.app",
      messagingSenderId: "322756405034",
      appId: "1:322756405034:web:a42662d8dcd420a91d2053",
      // measurementId ini tidak kita gunakan untuk auth/db/storage, tapi tidak masalah ada di sini
      measurementId: "G-E6YJZP6BPX"
    };

    // Inisialisasi Firebase App
    firebase.initializeApp(firebaseConfig);

    // Mendapatkan referensi ke layanan Firebase yang kita butuhkan
    // Firebase Authentication untuk login
    const auth = firebase.auth();
    // Firestore Database untuk menyimpan data profil siswa
    const db = firebase.firestore();
    // Firebase Storage untuk mengelola foto profil
    const storage = firebase.storage();
    
