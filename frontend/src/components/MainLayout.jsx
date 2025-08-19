// frontend/src/components/MainLayout.jsx

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import './MainLayout.css';
import logo from '../assets/image.png';

const MainLayout = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username') || userRole; // Gunakan username jika ada

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="main-layout">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Logo" />
                    <h3>Sistem Monitoring</h3>
                </div>
                <nav className="sidebar-nav">
                    {userRole === 'Staf TU' && (
                        <>
                            <NavLink to="/dashboard-staf-tu">Dashboard</NavLink>
                            <NavLink to="/data-guru">Data Guru</NavLink>
                            <NavLink to="/data-mata-pelajaran">Data Mata Pelajaran</NavLink>
                            <NavLink to="/data-kelas">Data Kelas</NavLink>
                            <NavLink to="/manajemen-akun">Manajemen Akun</NavLink>
                            <NavLink to="/unggah-data">Unggah Data Excel</NavLink>
                            <NavLink to="/ekspor-jadwal">Ekspor Jadwal</NavLink>
                        </>
                    )}
                    {userRole === 'Waka Kurikulum' && (
                         <>
                           
                            <NavLink to="/kelola-jadwal">Kelola Jadwal</NavLink>
                            <NavLink to="/data-guru">Data Guru</NavLink>
                            <NavLink to="/kelola-penugasan">Kelola Penugasan</NavLink>
                            <NavLink to="/data-kelas">Data Kelas</NavLink>
                            <NavLink to="/data-mata-pelajaran">Data Mata Pelajaran</NavLink>
                         </>
                    )}
                    {userRole === 'Kepala Sekolah' && (
                        <>
                            <NavLink to="/dashboard-kepala-sekolah">Dashboard Monitoring</NavLink>
                            <NavLink to="/data-guru">Data Guru</NavLink>
                            <NavLink to="/data-mata-pelajaran">Data Mata Pelajaran</NavLink>
                            <NavLink to="/data-kelas">Data Kelas</NavLink>
                        </>
                    )}
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-button">Logout</button>
                </div>
            </aside>
            <main className="content">
                <header className="main-header">
                    <h1>Selamat Datang, {username}</h1>
                </header>
                <div className="content-area">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default MainLayout;