// frontend/src/pages/KelolaDataMataPelajaran.jsx

import React, { useState, useEffect } from 'react';
import './KelolaDataMataPelajaran.css'; // File CSS baru
import ConfirmPopup from '../components/ConfirmPopup';

const KelolaDataMataPelajaran = () => {
    const [mataPelajaran, setMataPelajaran] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ kode_mapel: '', nama_mapel: '', jenjang_kelas: '' });
    const [showForm, setShowForm] = useState(false);
    const [mapelToEdit, setMapelToEdit] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [mapelToDeleteId, setMapelToDeleteId] = useState(null);

    const fetchMataPelajaran = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/mata-pelajaran');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setMataPelajaran(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMataPelajaran();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (mapel) => {
        setMapelToEdit(mapel);
        setFormData({ kode_mapel: mapel.kode_mapel, nama_mapel: mapel.nama_mapel, jenjang_kelas: mapel.jenjang_kelas });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = mapelToEdit
            ? `http://localhost:3001/api/mata-pelajaran/${mapelToEdit.id}`
            : 'http://localhost:3001/api/mata-pelajaran';
        
        const method = mapelToEdit ? 'PUT' : 'POST';

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

            fetchMataPelajaran();
            setFormData({ kode_mapel: '', nama_mapel: '', jenjang_kelas: '' });
            setMapelToEdit(null);
            setShowForm(false);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleShowConfirm = (id) => {
        setMapelToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleCancelDelete = () => {
        setShowConfirmPopup(false);
        setMapelToDeleteId(null);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/mata-pelajaran/${mapelToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchMataPelajaran();
            setShowConfirmPopup(false);
            setMapelToDeleteId(null);
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
        <div className="kelola-data-mapel-container fade-in">
            <div className="table-header">
                <h2>Daftar Mata Pelajaran</h2>
                <button onClick={() => { setShowForm(!showForm); setMapelToEdit(null); }} className="add-button">
                    {showForm ? 'Tutup Formulir' : 'Tambah Mata Pelajaran'}
                </button>
            </div>
            
            {showForm && (
                <form onSubmit={handleSubmit} className="mapel-form fade-in">
                    <h3>{mapelToEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}</h3>
                    <div className="form-group">
                        <label>Kode Mapel:</label>
                        <input type="text" name="kode_mapel" value={formData.kode_mapel} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Nama Mapel:</label>
                        <input type="text" name="nama_mapel" value={formData.nama_mapel} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Jenjang Kelas:</label>
                        <input type="text" name="jenjang_kelas" value={formData.jenjang_kelas} onChange={handleChange} required />
                    </div>
                    <button type="submit" className="submit-button">Simpan</button>
                    <button type="button" onClick={() => setShowForm(false)} className="cancel-button">Batal</button>
                </form>
            )}

            <table className="mapel-table fade-in">
                <thead>
                    <tr>
                        <th>Kode Mapel</th>
                        <th>Nama Mapel</th>
                        <th>Jenjang Kelas</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {mataPelajaran.map((mapel) => (
                        <tr key={mapel.id}>
                            <td>{mapel.kode_mapel}</td>
                            <td>{mapel.nama_mapel}</td>
                            <td>{mapel.jenjang_kelas}</td>
                            <td>
                                <button onClick={() => handleEditClick(mapel)} className="edit-button">Edit</button>
                                <button onClick={() => handleShowConfirm(mapel.id)} className="delete-button">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus data mata pelajaran ini?"
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default KelolaDataMataPelajaran;