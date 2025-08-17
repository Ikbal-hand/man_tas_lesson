// frontend/src/pages/LihatKonflik.jsx

import React, { useState, useEffect } from 'react';
import './LihatKonflik.css';
import ConfirmPopup from '../components/ConfirmPopup';

const LihatKonflik = () => {
    const [konflik, setKonflik] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchKonflik = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/jadwal/konflik');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setKonflik(data);
        } catch (e) {
            setError('Failed to fetch conflict data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKonflik();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="lihat-konflik-container fade-in">
            <h2>Konflik Jadwal</h2>
            {konflik.length > 0 ? (
                <table className="konflik-table">
                    <thead>
                        <tr>
                            <th>Hari</th>
                            <th>Waktu</th>
                            <th>Guru 1</th>
                            <th>Kelas 1</th>
                            <th>Guru 2</th>
                            <th>Kelas 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        {konflik.map((item, index) => (
                            <tr key={index}>
                                <td>{item.hari}</td>
                                <td>{`${item.jam_mulai.slice(0, 5)} - ${item.jam_selesai.slice(0, 5)}`}</td>
                                <td>{item.guru_1}</td>
                                <td>{item.kelas_1}</td>
                                <td>{item.guru_2}</td>
                                <td>{item.kelas_2}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="no-konflik-message">
                    <p>Tidak ada konflik jadwal yang terdeteksi.</p>
                </div>
            )}
        </div>
    );
};

export default LihatKonflik;