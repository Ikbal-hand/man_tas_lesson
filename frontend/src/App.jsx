// frontend/src/App.jsx

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Komponen utilitas & layout
import LoginPage from './components/LoginPage';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoutes';

// Impor semua halaman KONTEN Anda
import DashboardStafTU from './pages/DashboardStafTU';
import DashboardWaka from './pages/WakaKurikulumDashboard';
import DashboardKepalaSekolah from './pages/DashboardKepalaSekolah';
import KelolaDataGuru from './pages/KelolaDataGuru';
import KelolaDataMataPelajaran from './pages/KelolaDataMataPelajaran';
import KelolaDataKelas from './pages/KelolaDataKelas';
import ManajemenAkun from './pages/ManajemenAkun';
import UnggahDataExcel from './pages/UnggahDataExcel';
import EksporJadwal from './pages/EksporJadwal';
import KelolaJadwal from './pages/KelolaJadwal';
import KelolaPenugasan from './pages/KelolaPenugasan';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* Rute yang Dilindungi & Menggunakan MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          {/* Dashboard utama untuk setiap peran */}
          <Route path="/dashboard-staf-tu" element={<DashboardStafTU />} />
          <Route path="/dashboard-waka" element={<DashboardWaka />} />
          <Route path="/dashboard-kepala-sekolah" element={<DashboardKepalaSekolah />} />
          
          {/* Rute spesifik untuk Staf TU */}
          <Route path="/data-guru" element={<KelolaDataGuru />} />
          <Route path="/data-mata-pelajaran" element={<KelolaDataMataPelajaran />} />
          <Route path="/data-kelas" element={<KelolaDataKelas />} />
          <Route path="/manajemen-akun" element={<ManajemenAkun />} />
          <Route path="/unggah-data" element={<UnggahDataExcel />} />
          <Route path="/ekspor-jadwal" element={<EksporJadwal />} />

          
          {/* Rute spesifik untuk Waka Kurikulum */}
          <Route path="/kelola-jadwal" element={<KelolaJadwal />} />
            <Route path='/kelola-penugasan' element={<KelolaPenugasan />} />
        </Route>
        {/* Rute fallback untuk halaman yang tidak ditemukan */}
        <Route path="*" element={<div><h2>404 - Halaman Tidak Ditemukan</h2></div>} />
      </Routes>
    </Router>
  );
}

export default App;