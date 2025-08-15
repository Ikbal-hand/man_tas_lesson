// frontend/src/pages/EksporJadwal.jsx

import React, { useState, useEffect } from 'react';
import './EksporJadwal.css';

const EksporJadwal = () => {
    const [gurus, setGurus] = useState([]);
    const [kelas, setKelas] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [selectedGuru, setSelectedGuru] = useState('');
    const [selectedKelas, setSelectedKelas] = useState('');
    const [selectedHari, setSelectedHari] = useState('');
    const [loadingFilters, setLoadingFilters] = useState(true);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [error, setError] = useState(null);

    // Ambil data guru dan kelas untuk filter dropdown
    useEffect(() => {
        const fetchFilters = async () => {
            try {
                const [gurusRes, kelasRes] = await Promise.all([
                    fetch('http://localhost:3001/api/guru'),
                    fetch('http://localhost:3001/api/kelas')
                ]);

                const gurusData = await gurusRes.json();
                const kelasData = await kelasRes.json();

                setGurus(gurusData);
                setKelas(kelasData);
            } catch (e) {
                setError('Failed to fetch filter data.');
            } finally {
                setLoadingFilters(false);
            }
        };

        fetchFilters();
    }, []);

    // Gunakan useEffect untuk memuat pratinjau saat filter berubah
    useEffect(() => {
        const fetchPreview = async () => {
            setLoadingPreview(true);
            setPreviewData([]);

            let previewUrl = 'http://localhost:3001/api/export/preview?';
            const params = [];
            
            if (selectedGuru) params.push(`guru=${selectedGuru}`);
            if (selectedKelas) params.push(`kelas=${selectedKelas}`);
            if (selectedHari) params.push(`hari=${selectedHari}`);

            previewUrl += params.join('&');

            try {
                const response = await fetch(previewUrl);
                if (!response.ok) {
                    throw new Error('Failed to fetch preview data.');
                }
                const data = await response.json();
                setPreviewData(data);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoadingPreview(false);
            }
        };

        if (!loadingFilters) {
            fetchPreview();
        }
    }, [selectedGuru, selectedKelas, selectedHari, loadingFilters]);

    const handleExport = () => {
        let exportUrl = 'http://localhost:3001/api/export?';
        const params = [];

        if (selectedGuru) params.push(`guru=${selectedGuru}`);
        if (selectedKelas) params.push(`kelas=${selectedKelas}`);
        if (selectedHari) params.push(`hari=${selectedHari}`);

        exportUrl += params.join('&');
        window.open(exportUrl, '_blank');
    };

    // Fungsi helper untuk mengelompokkan data berdasarkan hari
    const groupDataByDay = (data) => {
        const groupedData = {};
        data.forEach(item => {
            if (!groupedData[item.hari]) {
                groupedData[item.hari] = [];
            }
            groupedData[item.hari].push(item);
        });
        return groupedData;
    };

    const groupedSchedule = groupDataByDay(previewData);

    if (loadingFilters) {
        return <div>Loading filters...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="ekspor-jadwal-container fade-in">
            <div className="export-header">
                <h2>Ekspor Jadwal Pelajaran</h2>
                <button 
                    onClick={handleExport} 
                    className="export-button" 
                    disabled={previewData.length === 0}
                >
                    Ekspor Jadwal
                </button>
            </div>
            
            <div className="filter-form">
                <div className="form-group">
                    <label>Filter Berdasarkan Guru:</label>
                    <select onChange={(e) => setSelectedGuru(e.target.value)} value={selectedGuru}>
                        <option value="">-- Semua Guru --</option>
                        {gurus.map(guru => (
                            <option key={guru.id} value={guru.nama}>{guru.nama}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Filter Berdasarkan Kelas:</label>
                    <select onChange={(e) => setSelectedKelas(e.target.value)} value={selectedKelas}>
                        <option value="">-- Semua Kelas --</option>
                        {kelas.map(kelas => (
                            <option key={kelas.id} value={kelas.nama_kelas}>{kelas.nama_kelas}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Filter Berdasarkan Hari:</label>
                    <select onChange={(e) => setSelectedHari(e.target.value)} value={selectedHari}>
                        <option value="">-- Semua Hari --</option>
                        <option value="Senin">Senin</option>
                        <option value="Selasa">Selasa</option>
                        <option value="Rabu">Rabu</option>
                        <option value="Kamis">Kamis</option>
                        <option value="Jumat">Jumat</option>
                    </select>
                </div>
            </div>

            {loadingPreview ? (
                <p>Memuat pratinjau...</p>
            ) : previewData.length > 0 ? (
                <div className="preview-table-container fade-in">
                    <h3>Pratinjau Data</h3>
                    {Object.keys(groupedSchedule).map(day => (
                        <div key={day}>
                            <h4>{day}</h4>
                            <table className="preview-table">
                                <thead>
                                    <tr>
                                        <th>Jam ke</th>
                                        <th>Waktu</th>
                                        <th>Guru</th>
                                        <th>Mata Pelajaran</th>
                                        <th>Kelas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedSchedule[day].map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.jam_ke}</td>
                                            <td>{`${item.jam_mulai.slice(0, 5)} - ${item.jam_selesai.slice(0, 5)}`}</td>
                                            <td>{item.nama_guru}</td>
                                            <td>{item.nama_mapel}</td>
                                            <td>{item.nama_kelas}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            ) : (
                <p>Tidak ada data jadwal yang cocok dengan filter.</p>
            )}
        </div>
    );
};

export default EksporJadwal;