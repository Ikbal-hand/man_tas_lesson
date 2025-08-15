// frontend/src/pages/KelolaDataGuru.jsx

import React, { useState, useEffect } from 'react';
import './KelolaDataGuru.css';
import ConfirmPopup from '../components/ConfirmPopup';

const KelolaDataGuru = () => {
    const [gurus, setGurus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ nip: '', nama: '', kode_guru: '' });
    const [showForm, setShowForm] = useState(false);
    
    // State baru untuk fitur edit
    const [guruToEdit, setGuruToEdit] = useState(null);

    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [guruToDeleteId, setGuruToDeleteId] = useState(null);

    const fetchGurus = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/guru');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (guru) => {
        setGuruToEdit(guru);
        setFormData({ nip: guru.nip, nama: guru.nama, kode_guru: guru.kode_guru });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = guruToEdit
            ? `http://localhost:3001/api/guru/${guruToEdit.id}`
            : 'http://localhost:3001/api/guru';
        
        const method = guruToEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchGurus();
            setFormData({ nip: '', nama: '', kode_guru: '' });
            setGuruToEdit(null); // Reset guru yang diedit
            setShowForm(false);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleShowConfirm = (id) => {
        setGuruToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleCancelDelete = () => {
        setShowConfirmPopup(false);
        setGuruToDeleteId(null);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/guru/${guruToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchGurus();
            setShowConfirmPopup(false);
            setGuruToDeleteId(null);
        } catch (e) {
            setError(e.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="kelola-data-guru-container fade-in">
            <div className="table-header">
                <h2>Daftar Guru</h2>
                <button onClick={() => { setShowForm(!showForm); setGuruToEdit(null); }} className="add-button">
                    {showForm ? 'Tutup Formulir' : 'Tambah Guru'}
                </button>
            </div>
            
            {showForm && (
                <form onSubmit={handleSubmit} className="guru-form fade-in">
                    <h3>{guruToEdit ? 'Edit Guru' : 'Tambah Guru Baru'}</h3>
                    <div className="form-group">
                        <label>NIP:</label>
                        <input type="text" name="nip" value={formData.nip} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Nama:</label>
                        <input type="text" name="nama" value={formData.nama} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Kode Guru:</label>
                        <input type="text" name="kode_guru" value={formData.kode_guru} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="submit-button">Simpan</button>
                    <button type="button" onClick={() => setShowForm(false)} className="cancel-button">Batal</button>
                </form>
            )}

            <table className="guru-table fade-in">
                <thead>
                    <tr>
                        <th>NIP</th>
                        <th>Nama</th>
                        <th>Kode Guru</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {gurus.map((guru) => (
                        <tr key={guru.id}>
                            <td>{guru.nip}</td>
                            <td>{guru.nama}</td>
                            <td>{guru.kode_guru}</td>
                            <td>
                                <button onClick={() => handleEditClick(guru)} className="edit-button">Edit</button>
                                <button onClick={() => handleShowConfirm(guru.id)} className="delete-button">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus data guru ini?"
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default KelolaDataGuru;