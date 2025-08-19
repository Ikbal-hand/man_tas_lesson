// frontend/src/pages/WakaKurikulumDashboard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WakaKurikulumDashboard.css';
import KelolaJadwal from './KelolaJadwal';
import LihatKonflik from './LihatKonflik';
import KelolaPenugasan from './KelolaPenugasan';

const WakaKurikulumDashboard = () => {
    const [activeMenu, setActiveMenu] = useState('kelola-jadwal');
    const navigate = useNavigate();

    const handleLogout = () => {
        navigate('/');
    };

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
    };

    const renderContent = () => {
        switch (activeMenu) {
            case 'kelola-jadwal':
                return <KelolaJadwal />;
            case 'kelola-penugasan':
                return <KelolaPenugasan />;
            default:
                return (
                    <div className="content-area-default fade-in">
                        <h2>Selamat Datang di Dashboard Waka Kurikulum</h2>
                        <p>Pilih menu di samping untuk mengelola jadwal pelajaran.</p>
                    </div>
                );
        }
    };

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <header className="main-header">
                    <h1>Dashboard Waka Kurikulum</h1>
                </header>
                <div className="content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default WakaKurikulumDashboard;