// frontend/src/pages/KelolaPenugasan.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './KelolaPenugasan.css';
import ConfirmPopup from '../components/ConfirmPopup';
import SearchBar from '../components/SearchBar';
import { FaTrash, FaPlus } from 'react-icons/fa';

const KelolaPenugasan = () => {
    const [penugasan, setPenugasan] = useState([]);
    const [gurus, setGurus] = useState([]);
    const [mataPelajaran, setMataPelajaran] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ id_guru: '', id_mata_pelajaran: '' });
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [penugasanToDeleteId, setPenugasanToDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [penugasanRes, gurusRes, mapelRes] = await Promise.all([
                fetch('http://localhost:3001/api/penugasan-guru'), // Menggunakan endpoint baru
                fetch('http://localhost:3001/api/guru'),
                fetch('http://localhost:3001/api/mata-pelajaran')
            ]);
            if (!penugasanRes.ok || !gurusRes.ok || !mapelRes.ok) throw new Error('Gagal memuat data.');
            
            setPenugasan(await penugasanRes.json() || []);
            setGurus(await gurusRes.json() || []);
            setMataPelajaran(await mapelRes.json() || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleOpenForm = () => {
        setFormData({ id_guru: '', id_mata_pelajaran: '' });
        setShowForm(true);
    };
    const handleCloseForm = () => {
        setShowForm(false);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            const response = await fetch('http://localhost:3001/api/penugasan-guru', { // Menggunakan endpoint baru
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal menyimpan data.');
            
            setPenugasan([...penugasan, result]);
            handleCloseForm();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowConfirm = (id) => {
        setPenugasanToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/penugasan-guru/${penugasanToDeleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus penugasan.');
            }
            setPenugasan(penugasan.filter(p => p.id !== penugasanToDeleteId));
            setShowConfirmPopup(false);
            setPenugasanToDeleteId(null);
        } catch (e) {
            alert(e.message);
            setShowConfirmPopup(false);
        }
    };
    
    const filteredPenugasan = useMemo(() => {
        if (!searchTerm) return penugasan;
        return penugasan.filter(p =>
            p.nama_guru.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [penugasan, searchTerm]);

    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="kelola-data-container">
            <div className="table-header">
                <h2>Manajemen Penugasan Guru</h2>
                <div className="header-actions">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Cari guru atau mapel..." />
                    <button onClick={handleOpenForm} className="add-button">
                        <FaPlus /> Tambah Penugasan
                    </button>
                </div>
            </div>
            
            {showForm && (
                <div className="modal-overlay">
                    <form onSubmit={handleSubmit} className="data-form fade-in">
                        <h3>Tambah Penugasan Baru</h3>
                        {error && <p className="error-message">{error}</p>}
                        <div className="form-group">
                            <label>Guru:</label>
                            <select name="id_guru" value={formData.id_guru} onChange={handleChange} required>
                                <option value="">-- Pilih Guru --</option>
                                {gurus.map(guru => <option key={guru.id} value={guru.id}>{guru.nama}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Mata Pelajaran:</label>
                            <select name="id_mata_pelajaran" value={formData.id_mata_pelajaran} onChange={handleChange} required>
                                <option value="">-- Pilih Mata Pelajaran --</option>
                                {mataPelajaran.map(mapel => <option key={mapel.id} value={mapel.id}>{mapel.nama_mapel}</option>)}
                            </select>
                        </div>
                        <div className="form-actions">
                            <button type="button" onClick={handleCloseForm} className="cancel-button">Batal</button>
                            <button type="submit" className="submit-button" disabled={isSubmitting}>
                                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nama Guru</th>
                            <th>Mata Pelajaran yang Diampu</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPenugasan.length > 0 ? (
                            filteredPenugasan.map((item) => (
                                <tr key={item.id}>
                                    <td>{item.nama_guru}</td>
                                    <td>{item.nama_mapel}</td>
                                    <td className="action-buttons">
                                        <button onClick={() => handleShowConfirm(item.id)} className="delete-button"><FaTrash /> Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan="3" className="empty-table-message">{searchTerm ? 'Pencarian tidak ditemukan.' : 'Belum ada data penugasan.'}</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus penugasan ini?"
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirmPopup(false)}
                />
            )}
        </div>
    );
};

export default KelolaPenugasan;