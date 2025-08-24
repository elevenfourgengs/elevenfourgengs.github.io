// js/profile.js
// Mendapatkan referensi elemen-elemen dari HTML
const profileForm = document.getElementById('profile-form');
const fullNameInput = document.getElementById('full-name');
const nicknameInput = document.getElementById('nickname');
const instagramInput = document.getElementById('instagram');
const whatsappInput = document.getElementById('whatsapp');
const profilePictureInput = document.getElementById('profile-picture-input');
const profileImgPreview = document.getElementById('profile-img-preview');
const initialsPlaceholder = document.getElementById('initials-placeholder');
const alertMessage = document.getElementById('alert-message');
const logoutButton = document.getElementById('logout-button');

let currentUser = null; // Variabel untuk menyimpan data pengguna yang sedang login

// --- FUNGSI UTILITY ---

// Fungsi untuk menampilkan pesan alert
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type} mt-3`;
    alertMessage.classList.remove('d-none');
    setTimeout(() => {
        alertMessage.classList.add('d-none');
    }, 5000);
}

// Fungsi untuk membuat inisial dari nama
function getInitials(name) {
    if (!name) return '?';
    const parts = name.split(' ').filter(word => word.length > 0);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    return '?';
}

// --- AUTENTIKASI DAN MEMUAT DATA ---

// Mengecek status autentikasi pengguna
auth.onAuthStateChanged(user => {
    if (user) {
        currentUser = user;
        // console.log("User is logged in:", user.uid); // Debugging
        loadProfileData(user.uid);
    } else {
        // Jika tidak login, arahkan kembali ke halaman login
        // console.log("User is logged out, redirecting to login."); // Debugging
        window.location.href = 'login.html';
    }
});

// Memuat data profil dari Firestore
async function loadProfileData(uid) {
    try {
        const docRef = db.collection('profiles').doc(uid);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            fullNameInput.value = data.name || '';
            nicknameInput.value = data.nickname || '';
            instagramInput.value = data.instagram || '';
            whatsappInput.value = data.whatsapp || '';

            if (data.photoUrl) {
                profileImgPreview.innerHTML = `<img src="${data.photoUrl}" class="profile-img" alt="Foto Profil">`;
            } else {
                initialsPlaceholder.textContent = getInitials(data.name || '');
                profileImgPreview.innerHTML = initialsPlaceholder.outerHTML; // Tampilkan inisial jika tidak ada foto
            }
            // console.log("Profile data loaded:", data); // Debugging
        } else {
            // Jika dokumen profil belum ada, buat dokumen baru dengan UID pengguna
            // console.log("No profile document found, creating new one."); // Debugging
            await db.collection('profiles').doc(uid).set({
                name: currentUser.displayName || '',
                email: currentUser.email,
                photoUrl: '',
                nickname: '',
                instagram: '',
                whatsapp: ''
            });
            initialsPlaceholder.textContent = getInitials(currentUser.displayName || '');
            profileImgPreview.innerHTML = initialsPlaceholder.outerHTML;
            showAlert('Profil baru dibuat. Silakan lengkapi data Anda.', 'info');
        }
    } catch (error) {
        // console.error("Error loading profile data:", error.message); // Debugging
        showAlert('Gagal memuat data profil: ' + error.message, 'danger');
    }
}

// --- LOGIKA UPLOAD FOTO ---

profilePictureInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!currentUser) {
        showAlert('Anda harus login untuk mengunggah foto.', 'danger');
        return;
    }

    const storageRef = storage.ref(`profile_pictures/${currentUser.uid}/${file.name}`);
    const uploadTask = storageRef.put(file);

    uploadTask.on('state_changed',
        (snapshot) => {
            // Handle progress, if needed
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            showAlert(`Mengunggah: ${progress.toFixed(0)}%`, 'info');
        },
        (error) => {
            // Handle unsuccessful uploads
            // console.error("Upload error:", error.message); // Debugging
            showAlert('Gagal mengunggah foto: ' + error.message, 'danger');
        },
        async () => {
            // Handle successful uploads on complete
            const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
            // Simpan URL foto ke Firestore
            await db.collection('profiles').doc(currentUser.uid).update({
                photoUrl: downloadURL
            });
            profileImgPreview.innerHTML = `<img src="${downloadURL}" class="profile-img" alt="Foto Profil">`;
            showAlert('Foto profil berhasil diunggah!', 'success');
            // console.log("Photo uploaded and URL saved:", downloadURL); // Debugging
        }
    );
});

// --- LOGIKA SIMPAN PERUBAHAN PROFIL ---

profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!currentUser) {
        showAlert('Anda harus login untuk menyimpan perubahan.', 'danger');
        return;
    }

    try {
        await db.collection('profiles').doc(currentUser.uid).update({
            name: fullNameInput.value,
            nickname: nicknameInput.value,
            instagram: instagramInput.value,
            whatsapp: whatsappInput.value
        });
        showAlert('Profil berhasil diperbarui!', 'success');
        // console.log("Profile updated successfully!"); // Debugging
        initialsPlaceholder.textContent = getInitials(fullNameInput.value || '');
    } catch (error) {
        // console.error("Error updating profile:", error.message); // Debugging
        showAlert('Gagal memperbarui profil: ' + error.message, 'danger');
    }
});

// --- LOGIKA LOGOUT ---

logoutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
        // console.log("User logged out."); // Debugging
        window.location.href = 'login.html'; // Arahkan kembali ke halaman login
    } catch (error) {
        // console.error("Logout error:", error.message); // Debugging
        showAlert('Gagal logout: ' + error.message, 'danger');
    }
});
