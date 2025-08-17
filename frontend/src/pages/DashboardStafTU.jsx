// frontend/src/pages/DashboardStafTU.jsx

import React, { useState, useEffect } from 'react';
// --- BARU: Impor ikon dari react-icons ---
import { FaChalkboardTeacher, FaSchool, FaBook } from 'react-icons/fa'; 
import './DashboardStafTU.css';
import GuruMengajar from './GuruMengajar';
import RealtimeInfo from './RealtimeInfo';

const DashboardStafTU = () => {
    const [summary, setSummary] = useState({ gurus: 0, classes: 0, subjects: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const [gurusRes, classesRes, subjectsRes] = await Promise.all([
                    fetch('http://localhost:3001/api/guru'),
                    fetch('http://localhost:3001/api/kelas'),
                    fetch('http://localhost:3001/api/mata-pelajaran'),
                ]);
                if (!gurusRes.ok || !classesRes.ok || !subjectsRes.ok) {
                    throw new Error('Gagal mengambil data ringkasan.');
                }
                const gurusData = await gurusRes.json();
                const classesData = await classesRes.json();
                const subjectsData = await subjectsRes.json();

                setSummary({
                    gurus: gurusData.length,
                    classes: classesData.length,
                    subjects: subjectsData.length,
                });
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) return <div className="loading-container">Memuat Dashboard...</div>;
    if (error) return <div className="error-container">Error: {error}</div>;

    return (
        <div className="dashboard-staf-tu-container fade-in">
            {/* --- PERUBAHAN: Struktur baru menggunakan CSS Grid --- */}
            <div className="dashboard-grid">
                
                <div className="summary-cards">
                    <div className="card card-guru">
                        <div className="card-icon">
                            <FaChalkboardTeacher size={32} />
                        </div>
                        <div className="card-content">
                            <h3>Total Guru</h3>
                            <p>{summary.gurus}</p>
                        </div>
                    </div>
                    <div className="card card-kelas">
                        <div className="card-icon">
                            <FaSchool size={32} />
                        </div>
                        <div className="card-content">
                            <h3>Total Kelas</h3>
                            <p>{summary.classes}</p>
                        </div>
                    </div>
                    <div className="card card-mapel">
                        <div className="card-icon">
                            <FaBook size={32} />
                        </div>
                        <div className="card-content">
                            <h3>Total Mata Pelajaran</h3>
                            <p>{summary.subjects}</p>
                        </div>
                    </div>
                </div>

                <div className="realtime-info-widget">
                     <RealtimeInfo />
                </div>
                
                <div className="monitoring-section-widget">
                    <GuruMengajar />
                </div>

            </div>
        </div>
    );
};

export default DashboardStafTU;