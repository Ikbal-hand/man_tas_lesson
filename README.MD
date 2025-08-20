# Sistem Monitoring Guru - MAN 2 Tasikmalaya

<div align="center">
  <img src="frontend/src/assets/image.png" alt="Logo MAN 2 Tasikmalaya" width="120px"/>
</div>
<br>

Sebuah aplikasi web yang dirancang untuk memonitoring aktivitas mengajar guru secara *real-time* di MAN 2 Tasikmalaya, serta menyediakan fitur manajemen jadwal yang komprehensif untuk Waka Kurikulum dan manajemen data master untuk Staf TU.

## Tampilan Aplikasi

Berikut adalah beberapa cuplikan tampilan dari aplikasi:

| Dashboard Kepala Sekolah | Kelola Jadwal (Waka Kurikulum) | Manajemen Data (Staf TU) |
| :---: | :---: | :---: |
| ![Dashboard Kepala Sekolah](image_d80c09.png) | ![Kelola Jadwal](image_fd1d7f.png) | ![Manajemen Data](frontend/src/assets/image.png) |

---

## Fitur Utama

Aplikasi ini memiliki fungsionalitas yang terpisah berdasarkan tiga peran utama: **Staf TU**, **Waka Kurikulum**, dan **Kepala Sekolah**.

### 👤 **Staf TU (Administrator)**
Bertanggung jawab atas pengelolaan semua data master di dalam aplikasi.
- **Manajemen Data Guru** (Tambah, Edit, Hapus, Cari)
- **Manajemen Data Mata Pelajaran** (Tambah, Edit, Hapus, Cari)
- **Manajemen Data Kelas** (Tambah, Edit, Hapus, Cari, Filter per Tingkat)
- **Manajemen Akun Pengguna** (Tambah, Edit, Hapus, Cari)
- **Manajemen Penugasan Guru** (Menghubungkan Guru dengan Mata Pelajaran yang diampu)
- **Unggah Data Massal** dari file Excel untuk data guru dan mata pelajaran.
- **Ekspor Jadwal** ke dalam format PDF dengan berbagai opsi tampilan.

### 👩‍🏫 **Waka Kurikulum (Moderator)**
Bertanggung jawab penuh atas pembuatan dan pengelolaan jadwal pelajaran.
- **Manajemen Multi-Jadwal** per Tahun Ajaran.
- **Kelola Jadwal Interaktif** dengan *drag-and-drop*.
- **Mode Pratinjau & Edit** untuk keamanan dan kemudahan penggunaan.
- **Simpan Tata Letak Jadwal** (urutan baris & waktu kustom) per tahun ajaran.
- **Fitur "Kosongkan Jadwal"** per kelas untuk pembersihan cepat.
- **Deteksi Konflik Jadwal** untuk mengidentifikasi jadwal yang tumpang tindih.
- **Manajemen Penugasan** untuk mengatur guru mana yang mengajar mata pelajaran apa.

### 👨‍💼 **Kepala Sekolah (Monitoring)**
Menggunakan aplikasi untuk kebutuhan monitoring guru dan jadwal secara keseluruhan.
- **Dashboard Monitoring Real-time** untuk melihat guru yang sedang mengajar saat ini.
- **Widget Hitung Mundur** untuk jadwal pelajaran berikutnya.
- **Melihat Jadwal Pelajaran** dengan tampilan daftar yang mudah dibaca dan difilter.
- **Melihat Riwayat Jadwal** (fitur yang dapat dikembangkan lebih lanjut).

---

## Teknologi yang Digunakan

| Kategori | Teknologi |
| :--- | :--- |
| **Frontend** | React, React Router, dnd-kit, jsPDF, html2canvas, react-icons |
| **Backend** | Node.js, Express.js, MySQL2 |
| **Database** | MySQL |
| **Development**| Vite, Nodemon |

---

## Instalasi & Menjalankan Proyek

Untuk menjalankan proyek ini di lingkungan lokal, ikuti langkah-langkah berikut:

### Prasyarat
- Node.js (v18 atau lebih baru)
- MySQL Server

### 1. Backend Setup
```bash
# 1. Masuk ke direktori backend
cd backend

# 2. Instal semua dependensi yang dibutuhkan
npm install

# 3. Buat database MySQL dengan nama 'lesson_manager' (atau sesuai konfigurasi Anda)

# 4. Import semua file .sql atau buat tabel secara manual sesuai skema yang ada

# 5. Buat file .env untuk konfigurasi database jika diperlukan

# 6. Jalankan server backend
nodemon server.js
```
Server backend akan berjalan di `http://localhost:3001`.

### 2. Frontend Setup
```bash
# 1. Buka terminal baru dan masuk ke direktori frontend
cd frontend

# 2. Instal semua dependensi yang dibutuhkan
npm install

# 3. Jalankan server development frontend
npm run dev
```
Aplikasi frontend akan berjalan di `http://localhost:3000` (atau port lain yang tersedia).

---

## Kontributor

Proyek ini dirancang dan dikembangkan oleh:
* **Muhamad Ikbal Handini** - *Program Studi Informatika, Sekolah Tinggi Teknologi Cipasung*

