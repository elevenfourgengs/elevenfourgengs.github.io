    // login.js
    // Mendapatkan referensi elemen-elemen dari HTML
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const alertMessage = document.getElementById('alert-message');

    // Menambahkan event listener untuk saat form disubmit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Mencegah halaman reload saat form disubmit

        const email = emailInput.value;
        const password = passwordInput.value;

        // Memanggil fungsi login dari Firebase Authentication
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Login berhasil, arahkan pengguna ke halaman profil
                // console.log("User logged in:", userCredential.user); // Untuk debugging
                window.location.href = 'profile.html';
            })
            .catch((error) => {
                // Login gagal, tampilkan pesan error
                // console.error("Login error:", error.message); // Untuk debugging
                showAlert(error.message, 'danger'); // Tampilkan pesan error di alert
            });
    });

    // Fungsi untuk menampilkan pesan alert
    function showAlert(message, type) {
        alertMessage.textContent = message; // Atur teks pesan
        alertMessage.className = `alert alert-${type} mt-3`; // Atur kelas CSS (e.g., alert-danger)
        alertMessage.classList.remove('d-none'); // Tampilkan alert
        setTimeout(() => {
            alertMessage.classList.add('d-none'); // Sembunyikan alert setelah 5 detik
        }, 5000);
    }
    
