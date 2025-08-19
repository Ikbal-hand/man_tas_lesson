import React, { useState, useEffect, useMemo } from 'react';
import './KelolaDataKelas.css';
import ConfirmPopup from '../components/ConfirmPopup';
import SearchBar from '../components/SearchBar';
import { FaEdit, FaTrash } from 'react-icons/fa';

const KelolaDataKelas = () => {
    const [kelas, setKelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ kode_kelas: '', nama_kelas: '', tingkat: '10' });
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [kelasToEdit, setKelasToEdit] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [kelasToDeleteId, setKelasToDeleteId] = useState(null);
    const [selectedTingkat, setSelectedTingkat] = useState('10');
    const [searchTerm, setSearchTerm] = useState('');

    const fetchKelas = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/kelas');
            if (!response.ok) throw new Error(`Gagal memuat data.`);
            const data = await response.json();
            setKelas(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchKelas();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleOpenForm = (data = null) => {
        if (data) {
            setKelasToEdit(data);
            // Pastikan ID juga disimpan untuk membedakan mode edit
            setFormData({ id: data.id, kode_kelas: data.kode_kelas, nama_kelas: data.nama_kelas, tingkat: data.tingkat });
        } else {
            setKelasToEdit(null);
            setFormData({ kode_kelas: '', nama_kelas: '', tingkat: selectedTingkat });
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setKelasToEdit(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const url = kelasToEdit ? `http://localhost:3001/api/kelas/${kelasToEdit.id}` : 'http://localhost:3001/api/kelas';
        const method = kelasToEdit ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal menyimpan data.');

            if (kelasToEdit) {
                setKelas(kelas.map(k => k.id === kelasToEdit.id ? result : k));
            } else {
                setKelas([...kelas, result]);
            }
            handleCloseForm();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowConfirm = (id) => {
        setKelasToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleDelete = async () => { /* ... (Tidak ada perubahan) ... */ };

    const filteredKelas = useMemo(() => {
        return kelas
            .filter(k => k.tingkat === selectedTingkat)
            .filter(k => 
                k.nama_kelas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                k.kode_kelas.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [kelas, selectedTingkat, searchTerm]);

    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="kelola-data-container">
            <div className="table-header">
                <h2>Manajemen Data Kelas</h2>
                <div className="header-actions">
                    <SearchBar 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        placeholder="Cari nama atau kode kelas..."
                    />
                    <button onClick={() => handleOpenForm()} className="add-button">
                        Tambah Kelas
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <form onSubmit={handleSubmit} className="data-form fade-in">
                        <h3>{kelasToEdit ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h3>
                        {error && <p className="error-message">{error}</p>}
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
                            <select name="tingkat" value={formData.tingkat} onChange={handleChange} required>
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
            
            <div className="filter-tabs">
                 <button onClick={() => setSelectedTingkat('10')} className={selectedTingkat === '10' ? 'active' : ''}>Tingkat X</button>
                <button onClick={() => setSelectedTingkat('11')} className={selectedTingkat === '11' ? 'active' : ''}>Tingkat XI</button>
                <button onClick={() => setSelectedTingkat('12')} className={selectedTingkat === '12' ? 'active' : ''}>Tingkat XII</button>
            </div>

            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Kode Kelas</th>
                            <th>Nama Kelas</th>
                            <th>Tingkat</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredKelas.length > 0 ? (
                            filteredKelas.map((data) => (
                                <tr key={data.id}>
                                    <td>{data.kode_kelas}</td>
                                    <td>{data.nama_kelas}</td>
                                    <td>{data.tingkat}</td>
                                    <td className="action-buttons">
                                        {/* --- PERBAIKAN DI SINI --- */}
                                        {/* Pastikan tombol memanggil handleOpenForm */}
                                        <button onClick={() => handleOpenForm(data)} className="edit-button"><FaEdit /> Edit</button>
                                        <button onClick={() => handleShowConfirm(data.id)} className="delete-button"><FaTrash /> Hapus</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="empty-table-message">
                                    {searchTerm ? `Pencarian untuk "${searchTerm}" tidak ditemukan.` : `Belum ada data kelas untuk tingkat ${selectedTingkat}.`}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus data kelas ini?"
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirmPopup(false)}
                />
            )}
        </div>
    );
};

export default KelolaDataKelas;