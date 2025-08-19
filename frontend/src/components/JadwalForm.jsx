// src/components/JadwalForm.jsx

import React, { useState, useEffect, useMemo } from 'react';
// --- PERUBAHAN: FaSearch tidak lagi diimpor ---
import './JadwalForm.css';

const JadwalForm = ({ initialData, onSubmit, onCancel, isSubmitting, error }) => {
    const [formData, setFormData] = useState(initialData);
    const [penugasanList, setPenugasanList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://localhost:3001/api/penugasan-guru')
            .then(res => res.json())
            .then(data => setPenugasanList(data || []))
            .catch(err => console.error("Gagal mengambil daftar penugasan:", err));
    }, []);
    
    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleSelectPenugasan = (id) => {
        setFormData({ ...formData, id_penugasan: id });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.id_penugasan) {
            alert("Silakan pilih penugasan terlebih dahulu.");
            return;
        }
        onSubmit(formData);
    };

    const filteredPenugasan = useMemo(() => {
        if (!searchTerm) return penugasanList;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return penugasanList.filter(p =>
            (p.nama_guru || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (p.nama_mapel || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (p.kode_guru || '').toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [penugasanList, searchTerm]);

    return (
        <div className="modal-overlay">
            <form onSubmit={handleSubmit} className="data-form fade-in">
                <h3>{initialData.isEditing ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</h3>
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label htmlFor="id_penugasan">Penugasan Guru & Mata Pelajaran:</label>
                    
                    <div className="searchable-select-container">
                        <div className="search-in-form">
                            {/* --- PERUBAHAN: Ikon FaSearch dihapus dari sini --- */}
                            <input 
                                type="text"
                                placeholder="Cari guru atau mata pelajaran..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <ul className="options-list">
                            {filteredPenugasan.length > 0 ? (
                                filteredPenugasan.map(p => (
                                    <li 
                                        key={p.id}
                                        className={`option-item ${formData.id_penugasan === p.id ? 'selected' : ''}`}
                                        onClick={() => handleSelectPenugasan(p.id)}
                                    >
                                        {/* --- PERUBAHAN: Kode guru tidak lagi ditampilkan --- */}
                                        <span className="option-text">{p.nama_guru} - <strong>{p.nama_mapel}</strong></span>
                                    </li>
                                ))
                            ) : (
                                <li className="option-item-empty">Tidak ada data ditemukan.</li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" onClick={onCancel} className="cancel-button">Batal</button>
                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                        {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default JadwalForm;