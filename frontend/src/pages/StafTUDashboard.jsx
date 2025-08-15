// frontend/src/pages/StafTUDashboard.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StafTUDashboard.css';
import KelolaDataGuru from './KelolaDataGuru';
import KelolaDataMataPelajaran from './KelolaDataMataPelajaran';
import KelolaDataKelas from './KelolaDataKelas';
import ManajemenAkun from './ManajemenAkun';
import UnggahDataExcel from './UnggahDataExcel';
import EksporJadwal from './EksporJadwal';
import GuruMengajar from './GuruMengajar';
import RealtimeInfo from './RealtimeInfo'; 
import DashboardStafTU from './DashboardStafTU';
const StafTUDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('dashboard');
    const navigate = useNavigate();

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
    };

    const handleLogout = () => {
        navigate('/');
    };

    const renderContent = () => {
        switch (activeMenu) {
            case 'dashboard':
                return <DashboardStafTU />;
            case 'data-guru':
                return <KelolaDataGuru />;
            case 'data-mata-pelajaran':
                return <KelolaDataMataPelajaran />;
            case 'data-kelas':
                return <KelolaDataKelas />;
            case 'manajemen-akun':
                return <ManajemenAkun />;
            case 'unggah-data':
                return <UnggahDataExcel />;
            case 'ekspor-jadwal':
                return <EksporJadwal />;
            default:
                return <div className="content-area-default">Pilih menu di samping untuk mengelola data.</div>;
        }
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src="../assets/image.png" alt="" />
                    <h2>Sistem Monitoring</h2>
                </div>
                <nav className="sidebar-nav">
                    <ul>
                        <li onClick={() => handleMenuClick('dashboard')}>
                            <button>Dashboard</button>
                        </li>
                        <li onClick={() => handleMenuClick('data-guru')}>
                            <button>Data Guru</button>
                        </li>
                        <li onClick={() => handleMenuClick('data-mata-pelajaran')}>
                            <button>Data Mata Pelajaran</button>
                        </li>
                        <li onClick={() => handleMenuClick('data-kelas')}>
                            <button>Data Kelas</button>
                        </li>
                        <li onClick={() => handleMenuClick('manajemen-akun')}>
                            <button >Manajemen Akun</button>
                        </li>
                        <li onClick={() => handleMenuClick('unggah-data')}>
                            <button>Unggah Data Excel</button>
                        </li>
                        <li onClick={() => handleMenuClick('ekspor-jadwal')}>
                            <button>Ekspor Jadwal</button>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="main-content">
                <header className="main-header">
                    <h1>Selamat Datang, Staf TU</h1>
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </header>
                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default StafTUDashboard;