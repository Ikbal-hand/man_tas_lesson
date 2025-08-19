import React, { useState, useEffect, useMemo } from 'react';
import './KelolaDataMataPelajaran.css';
import ConfirmPopup from '../components/ConfirmPopup';
import SearchBar from '../components/SearchBar';
import { FaEdit, FaTrash } from 'react-icons/fa';

const KelolaDataMataPelajaran = () => {
    const [mataPelajaran, setMataPelajaran] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ kode_mapel: '', nama_mapel: '', jenjang_kelas: '10' });
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mapelToEdit, setMapelToEdit] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [mapelToDeleteId, setMapelToDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchMataPelajaran = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/mata-pelajaran');
            if (!response.ok) throw new Error(`Gagal memuat data.`);
            const data = await response.json();
            setMataPelajaran(data || []);
        } catch (e) {
            setError(e.message);
            setMataPelajaran([]);
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

    const handleOpenForm = (mapel = null) => {
        if (mapel) {
            setMapelToEdit(mapel);
            setFormData({ id: mapel.id, kode_mapel: mapel.kode_mapel, nama_mapel: mapel.nama_mapel, jenjang_kelas: mapel.jenjang_kelas });
        } else {
            setMapelToEdit(null);
            setFormData({ kode_mapel: '', nama_mapel: '', jenjang_kelas: '10' });
        }
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
        
        const url = mapelToEdit ? `http://localhost:3001/api/mata-pelajaran/${mapelToEdit.id}` : 'http://localhost:3001/api/mata-pelajaran';
        const method = mapelToEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal menyimpan data.');

            if (mapelToEdit) {
                setMataPelajaran(mataPelajaran.map(m => m.id === mapelToEdit.id ? result : m));
            } else {
                setMataPelajaran([...mataPelajaran, result]);
            }
            handleCloseForm();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowConfirm = (id) => {
        setMapelToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/mata-pelajaran/${mapelToDeleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus data.');
            }
            setMataPelajaran(mataPelajaran.filter(m => m.id !== mapelToDeleteId));
            setShowConfirmPopup(false);
            setMapelToDeleteId(null);
        } catch (e) {
            alert(e.message);
        }
    };

    const filteredMataPelajaran = useMemo(() => {
        if (!searchTerm) return mataPelajaran;
        return mataPelajaran.filter(mapel =>
            mapel.nama_mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mapel.kode_mapel.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mapel.jenjang_kelas.toString().includes(searchTerm)
        );
    }, [mataPelajaran, searchTerm]);

    if (loading) return <div>Loading...</div>;
    if (error && !showForm) return <div className="error-container">{error}</div>;
    
    return (
        <div className="kelola-data-container">
            <div className="table-header">
                <h2>Manajemen Data Mata Pelajaran</h2>
                <div className="header-actions">
                    <SearchBar 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                        placeholder="Cari mapel, kode, atau jenjang..."
                    />
                    <button onClick={() => handleOpenForm()} className="add-button">
                        Tambah Mata Pelajaran
                    </button>
                </div>
            </div>
            
            {showForm && (
                <div className="modal-overlay">
                    <form onSubmit={handleSubmit} className="data-form fade-in">
                        <h3>{mapelToEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</h3>
                        {error && <p className="error-message">{error}</p>}
                        <div className="form-group">
                            <label>Kode Mapel:</label>
                            <input type="text" name="kode_mapel" value={formData.kode_mapel} onChange={handleChange} required disabled={isSubmitting} />
                        </div>
                        <div className="form-group">
                            <label>Nama Mapel:</label>
                            <input type="text" name="nama_mapel" value={formData.nama_mapel} onChange={handleChange} required disabled={isSubmitting} />
                        </div>
                        <div className="form-group">
                            <label>Jenjang Kelas:</label>
                            <select name="jenjang_kelas" value={formData.jenjang_kelas} onChange={handleChange} required disabled={isSubmitting}>
                                <option value="10">10</option>
                                <option value="11">11</option>
                                <option value="12">12</option>
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
                            <th>Kode Mapel</th>
                            <th>Nama Mapel</th>
                            <th>Jenjang Kelas</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMataPelajaran.length > 0 ? (
                            filteredMataPelajaran.map((mapel) => (
                                <tr key={mapel.id}>
                                    <td>{mapel.kode_mapel}</td>
                                    <td>{mapel.nama_mapel}</td>
                                    <td>{mapel.jenjang_kelas}</td>
                                    <td className="action-buttons">
                                        <button onClick={() => handleOpenForm(mapel)} className="edit-button"><FaEdit /> Edit</button>
                                        <button onClick={() => handleShowConfirm(mapel.id)} className="delete-button"><FaTrash /> Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="empty-table-message">
                                    {searchTerm ? `Pencarian untuk "${searchTerm}" tidak ditemukan.` : "Belum ada data mata pelajaran."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus data ini?"
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirmPopup(false)}
                />
            )}
        </div>
    );
};

export default KelolaDataMataPelajaran;