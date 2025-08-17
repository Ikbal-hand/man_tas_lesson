// frontend/src/pages/KelolaPenugasan.jsx

import React, { useState, useEffect } from 'react';
import './KelolaPenugasan.css';
import ConfirmPopup from '../components/ConfirmPopup';

const KelolaPenugasan = () => {
    const [penugasan, setPenugasan] = useState([]);
    const [gurus, setGurus] = useState([]);
    const [mataPelajaran, setMataPelajaran] = useState([]);
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ id_guru: '', id_mata_pelajaran: '', id_kelas: '' });
    
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [penugasanToDeleteId, setPenugasanToDeleteId] = useState(null);
    const [selectedTingkat, setSelectedTingkat] = useState('10'); // State baru untuk filter

    const fetchAllData = async () => {
        try {
            const [penugasanRes, gurusRes, mapelRes, kelasRes] = await Promise.all([
                fetch('http://localhost:3001/api/penugasan'),
                fetch('http://localhost:3001/api/guru'),
                fetch('http://localhost:3001/api/mata-pelajaran'),
                fetch('http://localhost:3001/api/kelas')
            ]);
            
            const penugasanData = await penugasanRes.json();
            const gurusData = await gurusRes.json();
            const mapelData = await mapelRes.json();
            const kelasData = await kelasRes.json();
            
            setPenugasan(penugasanData);
            setGurus(gurusData);
            setMataPelajaran(mapelData);
            setKelas(kelasData);
        } catch (e) {
            setError('Failed to fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:3001/api/penugasan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchAllData();
            setFormData({ id_guru: '', id_mata_pelajaran: '', id_kelas: '' });
            setShowForm(false);
        } catch (e) {
            setError(e.message);
        }
    };
    
    const handleShowConfirm = (id) => {
        setPenugasanToDeleteId(id);
        setShowConfirmPopup(true);
    };
    
    const handleCancelDelete = () => {
        setShowConfirmPopup(false);
        setPenugasanToDeleteId(null);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/penugasan/${penugasanToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchAllData();
            setShowConfirmPopup(false);
            setPenugasanToDeleteId(null);
        } catch (e) {
            setError(e.message);
        }
    };

    const filteredPenugasan = penugasan.filter(p => {
        const correspondingKelas = kelas.find(k => k.nama_kelas === p.nama_kelas);
        return correspondingKelas && correspondingKelas.tingkat === selectedTingkat;
    });

    const groupedByKelas = filteredPenugasan.reduce((acc, p) => {
        const kelasName = p.nama_kelas;
        if (!acc[kelasName]) {
            acc[kelasName] = [];
        }
        acc[kelasName].push(p);
        return acc;
    }, {});
    
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="kelola-penugasan-container fade-in">
            <div className="table-header">
                <h2>Kelola Penugasan Guru</h2>
                <button onClick={() => setShowForm(!showForm)} className="add-button">
                    {showForm ? 'Tutup Formulir' : 'Tambah Penugasan'}
                </button>
            </div>
            
            {showForm && (
                <form onSubmit={handleSubmit} className="penugasan-form fade-in">
                    <h3>Tambah Penugasan Baru</h3>
                    <div className="form-group">
                        <label>Guru:</label>
                        <select name="id_guru" value={formData.id_guru} onChange={handleChange} required>
                            <option value="">-- Pilih Guru --</option>
                            {gurus.map(guru => (
                                <option key={guru.id} value={guru.id}>{guru.nama}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Mata Pelajaran:</label>
                        <select name="id_mata_pelajaran" value={formData.id_mata_pelajaran} onChange={handleChange} required>
                            <option value="">-- Pilih Mata Pelajaran --</option>
                            {mataPelajaran.map(mapel => (
                                <option key={mapel.id} value={mapel.id}>{mapel.nama_mapel}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Kelas:</label>
                        <select name="id_kelas" value={formData.id_kelas} onChange={handleChange} required>
                            <option value="">-- Pilih Kelas --</option>
                            {kelas.map(k => (
                                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="submit-button">Simpan</button>
                    <button type="button" onClick={() => setShowForm(false)} className="cancel-button">Batal</button>
                </form>
            )}

            <div className="jadwal-tabs">
                <button onClick={() => setSelectedTingkat('10')} className={selectedTingkat === '10' ? 'active' : ''}>X</button>
                <button onClick={() => setSelectedTingkat('11')} className={selectedTingkat === '11' ? 'active' : ''}>XI</button>
                <button onClick={() => setSelectedTingkat('12')} className={selectedTingkat === '12' ? 'active' : ''}>XII</button>
            </div>

            {Object.keys(groupedByKelas).length > 0 ? (
                Object.keys(groupedByKelas).map(kelasName => (
                    <div key={kelasName} className="penugasan-per-kelas fade-in">
                        <h3>{kelasName}</h3>
                        <table className="penugasan-table">
                            <thead>
                                <tr>
                                    <th>Guru</th>
                                    <th>Mata Pelajaran</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupedByKelas[kelasName].map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.nama_guru}</td>
                                        <td>{item.nama_mapel}</td>
                                        <td>
                                            <button onClick={() => handleShowConfirm(item.id)} className="delete-button">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))
            ) : (
                <p>Tidak ada penugasan guru untuk tingkat kelas ini.</p>
            )}

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus penugasan ini?"
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default KelolaPenugasan;