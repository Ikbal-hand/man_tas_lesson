// frontend/src/pages/DashboardStafTU.jsx

import React, { useState, useEffect } from 'react';
import './DashboardStafTU.css';
import GuruMengajar from './GuruMengajar';
import RealtimeInfo from './RealtimeInfo'; // Import komponen RealtimeInfo

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

                const gurusData = await gurusRes.json();
                const classesData = await classesRes.json();
                const subjectsData = await subjectsRes.json();

                setSummary({
                    gurus: gurusData.length,
                    classes: classesData.length,
                    subjects: subjectsData.length,
                });
            } catch (e) {
                setError('Failed to fetch summary data.');
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard-staf-tu-container fade-in">
            {/* Tambahkan komponen realtime di sini */}
            <RealtimeInfo />
            
            <h2>Ringkasan Data</h2>
            <div className="summary-cards">
                <div className="card">
                    <h3>Total Guru</h3>
                    <p>{summary.gurus}</p>
                </div>
                <div className="card">
                    <h3>Total Kelas</h3>
                    <p>{summary.classes}</p>
                </div>
                <div className="card">
                    <h3>Total Mata Pelajaran</h3>
                    <p>{summary.subjects}</p>
                </div>
            </div>
            
            <div className="monitoring-section">
                <GuruMengajar />
            </div>
        </div>
    );
};

export default DashboardStafTU;