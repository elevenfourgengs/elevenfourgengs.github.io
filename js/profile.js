// js/profile.js
// Import layanan Firebase dari file konfigurasi kita
import { auth, db, storage } from './firebase-config.js';
// Import fungsi-fungsi yang dibutuhkan dari Firebase SDK v9
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-auth.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-firestore.js";
import { ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.7/firebase-storage.js";

// Mendapatkan referensi elemen-elemen dari HTML (ID disesuaikan)
const profileContainer = document.getElementById('profile-container');
const loadingMessage = document.getElementById('loading-message');
const profilePicPreview = document.getElementById('profile-pic-preview');
const fileInput = document.getElementById('file-input');
const uploadProgress = document.getElementById('upload-progress');
const profileForm = document.getElementById('profile-form');
const fullNameInput = document.getElementById('full-name'); // ID disesuaikan
const nicknameInput = document.getElementById('nickname');   // ID disesuaikan
const instagramInput = document.getElementById('instagram'); // ID disesuaikan
const whatsappInput = document.getElementById('whatsapp');   // ID baru
const mottoInput = document.getElementById('motto');         // ID baru
const saveBtn = document.getElementById('save-btn');
const messageEl = document.getElementById('message'); // Untuk pesan sukses/error
const logoutButton = document.getElementById('logout-button'); // ID disesuaikan

let currentUser = null; // Variabel untuk menyimpan data pengguna yang sedang login
let currentProfileRef = null; // Referensi dokumen Firestore untuk profil pengguna

// --- FUNGSI UTILITY ---

// Fungsi untuk menampilkan pesan (mirip showAlert tapi menggunakan messageEl)
function showStatusMessage(message, type) {
    messageEl.textContent = message;
    messageEl.className = type; // 'success' atau 'error'
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = '';
    }, 5000);
}

// --- AUTENTIKASI DAN MEMUAT DATA ---

// Mengecek status autentikasi pengguna secara real-time
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        currentProfileRef = doc(db, 'profiles', user.uid); // Membuat referensi dokumen Firestore
        
        loadingMessage.style.display = 'none'; // Sembunyikan pesan loading
        profileContainer.style.display = 'block'; // Tampilkan form profil

        await loadProfileData(); // Panggil fungsi untuk memuat data profil
    } else {
        // Jika tidak login, arahkan kembali ke halaman login
        window.location.href = 'login.html';
    }
});

// Memuat data profil dari Firestore
async function loadProfileData() {
    try {
        const docSnap = await getDoc(currentProfileRef); // Mengambil dokumen profil

        if (docSnap.exists()) {
            const data = docSnap.data();
            fullNameInput.value = data.fullName || currentUser.displayName || ''; // Gunakan displayName dari Auth jika belum ada di Firestore
            nicknameInput.value = data.nickname || '';
            instagramInput.value = data.instagram || '';
            whatsappInput.value = data.whatsapp || ''; // Memuat data WhatsApp
            mottoInput.value = data.motto || ''; // Memuat data Motto

            if (data.photoURL) { // Perhatikan 'photoURL'
                profilePicPreview.src = data.photoURL;
            } else {
                profilePicPreview.src = "https://via.placeholder.com/120?text=XI-4"; // Placeholder default
            }
        } else {
            // Jika dokumen profil belum ada, buat dokumen baru dengan data awal
            await setDoc(currentProfileRef, {
                fullName: currentUser.displayName || '',
                email: currentUser.email,
                photoURL: "https://via.placeholder.com/120?text=XI-4", // URL default placeholder
                nickname: '',
                instagram: '',
                whatsapp: '',
                motto: ''
            });
            fullNameInput.value = currentUser.displayName || '';
            showStatusMessage('Profil baru dibuat. Silakan lengkapi data Anda.', 'success');
        }
    } catch (error) {
        console.error("Error loading profile data:", error);
        showStatusMessage('Gagal memuat data profil: ' + error.message, 'error');
    }
}

// --- LOGIKA UPLOAD FOTO ---

profilePicPreview.addEventListener('click', () => fileInput.click()); // Klik gambar memicu input file

fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files[0]));

async function handleFileUpload(file) {
    if (!file || !currentUser) {
        showStatusMessage('Pilih file atau Anda belum login.', 'error');
        return;
    }

    try {
        const storageReference = ref(storage, `profile_pictures/${currentUser.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageReference, file);

        uploadProgress.style.display = 'block'; // Tampilkan progress bar
        saveBtn.disabled = true; // Nonaktifkan tombol simpan saat upload

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                uploadProgress.value = progress;
            },
            (error) => {
                console.error("Upload failed:", error);
                showStatusMessage('Gagal mengunggah foto!', 'error');
                uploadProgress.style.display = 'none';
                saveBtn.disabled = false;
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                profilePicPreview.src = downloadURL; // Update gambar di preview
                await updateDoc(currentProfileRef, { photoURL: downloadURL }); // Simpan URL ke Firestore
                showStatusMessage('Foto profil berhasil diunggah!', 'success');
                uploadProgress.style.display = 'none';
                saveBtn.disabled = false;
            }
        );
    } catch (error) {
        console.error("Error handling file upload:", error);
        showStatusMessage('Terjadi kesalahan saat upload: ' + error.message, 'error');
        saveBtn.disabled = false;
    }
}

// --- LOGIKA SIMPAN PERUBAHAN PROFIL ---

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) {
        showStatusMessage('Anda harus login untuk menyimpan perubahan.', 'error');
        return;
    }

    saveBtn.disabled = true;
    showStatusMessage('Menyimpan...', 'info'); // Gunakan 'info' untuk status sementara

    try {
        await updateDoc(currentProfileRef, {
            fullName: fullNameInput.value,
            nickname: nicknameInput.value,
            instagram: instagramInput.value,
            whatsapp: whatsappInput.value, // Simpan data WhatsApp
            motto: mottoInput.value        // Simpan data Motto
        });
        showStatusMessage('Profil berhasil diperbarui!', 'success');
    } catch (error) {
        console.error("Error updating profile:", error);
        showStatusMessage('Gagal memperbarui profil: ' + error.message, 'error');
    }
    saveBtn.disabled = false;
});

// --- LOGIKA LOGOUT ---

logoutButton.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = 'index.html'; // Arahkan ke halaman utama setelah logout
    } catch (error) {
        console.error("Logout error:", error);
        showStatusMessage('Gagal logout: ' + error.message, 'error');
    }
});

fix: Perbaiki js/profile.js dengan kode JavaScript yang benar
