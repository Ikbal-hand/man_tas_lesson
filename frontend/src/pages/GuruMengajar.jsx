// frontend/src/pages/GuruMengajar.jsx

import React, { useState, useEffect } from 'react';
import './GuruMengajar.css'; // File CSS baru

const GuruMengajar = () => {
    const [currentLessons, setCurrentLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCurrentLessons = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/monitoring/current');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCurrentLessons(data);
        } catch (e) {
            setError('Failed to fetch current lesson data.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Ambil data saat komponen pertama kali dimuat
        fetchCurrentLessons();
        
        // Atur interval untuk mengambil data setiap 60 detik
        const intervalId = setInterval(fetchCurrentLessons, 60000);

        // Bersihkan interval saat komponen dilepas
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return <div className="loading-message">Memuat data monitoring...</div>;
    }

    if (error) {
        return <div className="error-message">Error: {error}</div>;
    }

    return (
        <div className="guru-mengajar-container fade-in">
            <h3>Guru yang Sedang Mengajar Saat Ini</h3>
            {currentLessons.length > 0 ? (
                <div className="lesson-cards">
                    {currentLessons.map((lesson, index) => (
                        <div className="lesson-card" key={index}>
                            <div className="card-header">
                                <h4>{lesson.nama_guru}</h4>
                            </div>
                            <div className="card-body">
                                <p><strong>Mata Pelajaran:</strong> {lesson.nama_mapel}</p>
                                <p><strong>Kelas:</strong> {lesson.nama_kelas}</p>
                                <p><strong>Waktu:</strong> {lesson.jam_mulai.slice(0, 5)} - {lesson.jam_selesai.slice(0, 5)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-lessons-message">
                    <p>Tidak ada guru yang sedang mengajar saat ini.</p>
                </div>
            )}
        </div>
    );
};

export default GuruMengajar;