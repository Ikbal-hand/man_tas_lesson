// frontend/src/pages/KelolaDataGuru.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './KelolaDataGuru.css';
import ConfirmPopup from '../components/ConfirmPopup';
import SearchBar from '../components/SearchBar';
import { FaEdit, FaTrash } from 'react-icons/fa';

// --- Form Component (dibuat terpisah untuk kerapian) ---
const GuruForm = ({ initialData, onSubmit, onCancel, isSubmitting, error }) => {
    const [formData, setFormData] = useState(initialData);

    useEffect(() => {
        setFormData(initialData);
    }, [initialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="modal-overlay">
            <form onSubmit={handleSubmit} className="data-form fade-in">
                <h3>{initialData.id ? 'Edit Guru' : 'Tambah Guru Baru'}</h3>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label htmlFor="nip">NIP (Opsional):</label>
                    <input id="nip" type="text" name="nip" value={formData.nip} onChange={handleChange} disabled={isSubmitting} />
                </div>
                <div className="form-group">
                    <label htmlFor="nama">Nama:</label>
                    <input id="nama" type="text" name="nama" value={formData.nama} onChange={handleChange} required disabled={isSubmitting} />
                </div>
                <div className="form-group">
                    <label htmlFor="kode_guru">Kode Guru:</label>
                    <input id="kode_guru" type="text" name="kode_guru" value={formData.kode_guru} onChange={handleChange} required disabled={isSubmitting} />
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


// --- Main Component ---
const KelolaDataGuru = () => {
    const [gurus, setGurus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formInitialData, setFormInitialData] = useState({ nip: '', nama: '', kode_guru: '' });
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [guruToDeleteId, setGuruToDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchGurus = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/guru');
            if (!response.ok) throw new Error(`Gagal memuat data guru.`);
            const data = await response.json();
            setGurus(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGurus();
    }, []);

    const handleOpenForm = (guru = null) => {
        if (guru) {
            setFormInitialData({ id: guru.id, nip: guru.nip || '', nama: guru.nama, kode_guru: guru.kode_guru });
        } else {
            setFormInitialData({ nip: '', nama: '', kode_guru: '' });
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setError(null);
    };

    const handleSubmit = async (formData) => {
        setIsSubmitting(true);
        setError(null);
        
        const isEditing = !!formData.id;
        const url = isEditing ? `http://localhost:3001/api/guru/${formData.id}` : 'http://localhost:3001/api/guru';
        const method = isEditing ? 'PUT' : 'POST';
        const payload = { ...formData, nip: formData.nip === '' ? null : formData.nip };

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal menyimpan data.');

            if (isEditing) {
                setGurus(gurus.map(g => g.id === formData.id ? result : g));
            } else {
                setGurus([...gurus, result]);
            }
            handleCloseForm();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowConfirm = (id) => {
        setGuruToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/guru/${guruToDeleteId}`, { method: 'DELETE' });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus data.');
            }
            setGurus(gurus.filter(g => g.id !== guruToDeleteId));
            setShowConfirmPopup(false);
            setGuruToDeleteId(null);
        } catch (e) {
            alert(e.message);
            setShowConfirmPopup(false);
        }
    };

    const filteredGurus = useMemo(() => {
        if (!searchTerm) return gurus;
        return gurus.filter(guru => 
            guru.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (guru.nip && guru.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
            guru.kode_guru.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [gurus, searchTerm]);

    if (loading) return <div>Loading...</div>;
    if (error && !showForm) return <div className="error-container">{error}</div>;
    
    return (
        <div className="kelola-data-container">
            <div className="table-header">
                <h2>Manajemen Data Guru</h2>
                <div className="header-actions">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Cari guru (nama, NIP, kode)..." />
                    <button onClick={() => handleOpenForm()} className="add-button">
                        Tambah Guru
                    </button>
                </div>
            </div>
            
            {showForm && (
                <GuruForm 
                    initialData={formInitialData}
                    onSubmit={handleSubmit}
                    onCancel={handleCloseForm}
                    isSubmitting={isSubmitting}
                    error={error}
                />
            )}

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>NIP</th>
                            <th>Nama</th>
                            <th>Kode Guru</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredGurus.length > 0 ? (
                            filteredGurus.map((guru) => (
                                <tr key={guru.id}>
                                    <td>{guru.nip || '-'}</td>
                                    <td>{guru.nama}</td>
                                    <td>{guru.kode_guru}</td>
                                    <td className="action-buttons">
                                        <button onClick={() => handleOpenForm(guru)} className="edit-button" aria-label="Edit"><FaEdit /> Edit</button>
                                        <button onClick={() => handleShowConfirm(guru.id)} className="delete-button" aria-label="Hapus"><FaTrash /> Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="empty-table-message">
                                    {searchTerm ? `Tidak ada data guru yang cocok dengan pencarian "${searchTerm}".` : "Belum ada data guru. Silakan tambahkan data baru."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus data guru ini?"
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirmPopup(false)}
                />
            )}
        </div>
    );
};

export default KelolaDataGuru;