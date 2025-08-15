# 🏫 Sistem Monitoring Guru MAN 2 TASIKMALAYA

### Deskripsi Proyek
Sistem Monitoring Guru adalah aplikasi web yang dirancang untuk membantu pihak sekolah dalam mengelola dan memantau kegiatan belajar mengajar. Aplikasi ini berfokus pada manajemen data guru, mata pelajaran, kelas, serta penjadwalan. Fitur utamanya adalah pemantauan real-time guru yang sedang mengajar, manajemen jadwal, dan ekspor data yang efisien.

### Fitur Utama

Aplikasi ini dibagi menjadi beberapa peran pengguna dengan fungsionalitas khusus:

**1. Staf TU**
* **Manajemen Data Master**: Mengelola data guru, mata pelajaran, dan kelas (tambah, edit, hapus, lihat).
* **Manajemen Akun**: Membuat, mengedit, dan menghapus akun pengguna dengan peran yang berbeda.
* **Unggah Data**: Memasukkan data master secara massal menggunakan file Excel.
* **Ekspor Jadwal**: Mengunduh jadwal pelajaran dalam format Excel dengan filter kustom.

**2. Waka Kurikulum**
* **Manajemen Jadwal**: Membuat, mengedit, dan menghapus jadwal pelajaran.
* **Deteksi Konflik**: Melihat dan menyelesaikan konflik jadwal mengajar.

**3. Kepala Sekolah**
* **Monitoring Real-time**: Melihat guru yang sedang mengajar di kelas secara langsung.
* **Melihat Jadwal**: Menampilkan jadwal pelajaran secara keseluruhan.
* **Riwayat Jadwal**: Melihat riwayat jadwal mengajar.

### Teknologi

Proyek ini dibangun dengan pendekatan monorepo yang memisahkan frontend dan backend:

-   **Frontend**: `React.js`
-   **Backend**: `Express.js`
-   **Database**: `MySQL`

### Instalasi

Untuk menjalankan proyek ini di lingkungan lokal Anda, ikuti langkah-langkah berikut:

**1. Clone Repositori**
```bash
git clone [https://github.com/nama-pengguna/nama-repo.git](https://github.com/nama-pengguna/nama-repo.git)
cd nama-repo