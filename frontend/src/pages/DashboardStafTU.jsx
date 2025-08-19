import React, { useState, useEffect } from 'react';
import { FaChalkboardTeacher, FaSchool, FaBook } from 'react-icons/fa'; 
import './DashboardStafTU.css';
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
        <div className="dashboard-staf-tu-container">
            <div className="dashboard-header">
                <h2>Dashboard Staf TU</h2>
                <p>Ringkasan data utama sistem monitoring guru.</p>
            </div>

            <div className="dashboard-grid">
                <div className="summary-cards">
                    <div className="card">
                        <div className="card-icon guru">
                            <FaChalkboardTeacher />
                        </div>
                        <div className="card-info">
                            <h3>Total Guru</h3>
                            <p>{summary.gurus}</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-icon kelas">
                            <FaSchool />
                        </div>
                        <div className="card-info">
                            <h3>Total Kelas</h3>
                            <p>{summary.classes}</p>
                        </div>
                    </div>
                    <div className="card">
                        <div className="card-icon mapel">
                            <FaBook />
                        </div>
                        <div className="card-info">
                            <h3>Total Mata Pelajaran</h3>
                            <p>{summary.subjects}</p>
                        </div>
                    </div>
                </div>

                <div className="realtime-info-widget widget">
                     <h3>Informasi Real-time</h3>
                     <RealtimeInfo />
                </div>
                
                {/* Anda bisa menambahkan widget lain di sini jika diperlukan */}
                {/* <div className="another-widget widget"> ... </div> */}
            </div>
        </div>
    );
};

export default DashboardStafTU;