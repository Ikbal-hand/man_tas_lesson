// frontend/src/pages/KelolaDataKelas.jsx

import React, { useState, useEffect } from 'react';
import './KelolaDataKelas.css';
import ConfirmPopup from '../components/ConfirmPopup';

const KelolaDataKelas = () => {
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ kode_kelas: '', nama_kelas: '', tingkat: '' });
    const [showForm, setShowForm] = useState(false);
    const [kelasToEdit, setKelasToEdit] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [kelasToDeleteId, setKelasToDeleteId] = useState(null);

    const fetchKelas = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/kelas');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setKelas(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKelas();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (data) => {
        setKelasToEdit(data);
        setFormData({ kode_kelas: data.kode_kelas, nama_kelas: data.nama_kelas, tingkat: data.tingkat });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = kelasToEdit
            ? `http://localhost:3001/api/kelas/${kelasToEdit.id}`
            : 'http://localhost:3001/api/kelas';
        
        const method = kelasToEdit ? 'PUT' : 'POST';

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

            fetchKelas();
            setFormData({ kode_kelas: '', nama_kelas: '', tingkat: '' });
            setKelasToEdit(null);
            setShowForm(false);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleShowConfirm = (id) => {
        setKelasToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleCancelDelete = () => {
        setShowConfirmPopup(false);
        setKelasToDeleteId(null);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/kelas/${kelasToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchKelas();
            setShowConfirmPopup(false);
            setKelasToDeleteId(null);
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
        <div className="kelola-data-kelas-container fade-in">
            <div className="table-header">
                <h2>Daftar Kelas</h2>
                <button onClick={() => { setShowForm(!showForm); setKelasToEdit(null); }} className="add-button">
                    {showForm ? 'Tutup Formulir' : 'Tambah Kelas'}
                </button>
            </div>
            
            {showForm && (
                <form onSubmit={handleSubmit} className="kelas-form fade-in">
                    <h3>{kelasToEdit ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
                    <div className="form-group">
                        <label>Kode Kelas:</label>
                        <input type="text" name="kode_kelas" value={formData.kode_kelas} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Nama Kelas:</label>
                        <input type="text" name="nama_kelas" value={formData.nama_kelas} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Tingkat:</label>
                        <input type="text" name="tingkat" value={formData.tingkat} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="submit-button">Simpan</button>
                    <button type="button" onClick={() => setShowForm(false)} className="cancel-button">Batal</button>
                </form>
            )}

            <table className="kelas-table fade-in">
                <thead>
                    <tr>
                        <th>Kode Kelas</th>
                        <th>Nama Kelas</th>
                        <th>Tingkat</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {kelas.map((data) => (
                        <tr key={data.id}>
                            <td>{data.kode_kelas}</td>
                            <td>{data.nama_kelas}</td>
                            <td>{data.tingkat}</td>
                            <td>
                                <button onClick={() => handleEditClick(data)} className="edit-button">Edit</button>
                                <button onClick={() => handleShowConfirm(data.id)} className="delete-button">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus data kelas ini?"
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default KelolaDataKelas;