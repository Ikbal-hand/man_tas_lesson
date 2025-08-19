import React, { useState, useEffect } from 'react';
import './ManajemenTahunAjaranModal.css';
import { FaTrash, FaEdit } from 'react-icons/fa';

const ManajemenTahunAjaranModal = ({ onClose, onDataChange }) => {
    const [list, setList] = useState([]);
    const [formData, setFormData] = useState({ id: null, nama_tahun_ajaran: '', is_active: false });
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/tahun-ajaran');
            const data = await response.json();
            setList(data || []);
        } catch (err) {
            setError('Gagal memuat data.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEdit = (item) => {
        setFormData({ id: item.id, nama_tahun_ajaran: item.nama_tahun_ajaran, is_active: !!item.is_active });
    };
    
    const handleCancelEdit = () => {
        setFormData({ id: null, nama_tahun_ajaran: '', is_active: false });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = formData.id 
            ? `http://localhost:3001/api/tahun-ajaran/${formData.id}` 
            : 'http://localhost:3001/api/tahun-ajaran';
        const method = formData.id ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama_tahun_ajaran: formData.nama_tahun_ajaran,
                    is_active: formData.is_active
                })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal menyimpan.');
            
            onDataChange(); // Beri sinyal ke halaman utama untuk refresh data
            handleCancelEdit(); // Reset form
            fetchData(); // Muat ulang daftar di modal
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus tahun ajaran ini?")) return;
        try {
            const response = await fetch(`http://localhost:3001/api/tahun-ajaran/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Gagal menghapus.');

            onDataChange();
            fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="ta-modal-content">
                <div className="ta-modal-header">
                    <h2>Kelola Tahun Ajaran</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                
                <div className="ta-modal-body">
                    <ul className="ta-list">
                        {list.map(item => (
                            <li key={item.id} className={item.is_active ? 'active' : ''}>
                                <span>{item.nama_tahun_ajaran} {item.is_active && '(Aktif)'}</span>
                                <div className="ta-actions">
                                    <button onClick={() => handleEdit(item)}><FaEdit /> Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="delete"><FaTrash /></button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <form onSubmit={handleSubmit} className="ta-form">
                        <h4>{formData.id ? 'Edit Tahun Ajaran' : 'Tambah Tahun Ajaran Baru'}</h4>
                        {error && <p className="error-message">{error}</p>}
                        <input 
                            type="text" 
                            name="nama_tahun_ajaran"
                            placeholder="Contoh: 2025/2026 Ganjil"
                            value={formData.nama_tahun_ajaran}
                            onChange={handleChange}
                            required
                        />
                        <div className="checkbox-group">
                            <input 
                                type="checkbox" 
                                id="is_active" 
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />
                            <label htmlFor="is_active">Jadikan Tahun Ajaran Aktif</label>
                        </div>
                        <div className="form-actions">
                             {formData.id && <button type="button" onClick={handleCancelEdit} className="cancel-button">Batal Edit</button>}
                            <button type="submit" className="submit-button">Simpan</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManajemenTahunAjaranModal;