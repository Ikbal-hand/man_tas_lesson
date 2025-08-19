// frontend/src/pages/ManajemenAkun.jsx

import React, { useState, useEffect, useMemo } from 'react'; // <-- PERBAIKAN DI SINI
import './ManajemenAkun.css'; 
import ConfirmPopup from '../components/ConfirmPopup';
import { FaEdit, FaTrash } from 'react-icons/fa';
import SearchBar from '../components/SearchBar';

const ManajemenAkun = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'Staf TU' });
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) throw new Error('Gagal memuat data akun.');
            const data = await response.json();
            setUsers(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOpenForm = (user = null) => {
        if (user) {
            setUserToEdit(user);
            setFormData({ username: user.username, password: '', role: user.role });
        } else {
            setUserToEdit(null);
            setFormData({ username: '', password: '', role: 'Staf TU' });
        }
        setShowForm(true);
    };
    
    const handleCloseForm = () => {
        setShowForm(false);
        setUserToEdit(null);
        setFormData({ username: '', password: '', role: 'Staf TU' });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        const url = userToEdit ? `http://localhost:3001/api/users/${userToEdit.id}` : 'http://localhost:3001/api/users';
        const method = userToEdit ? 'PUT' : 'POST';

        const payload = { ...formData };
        if (userToEdit && !payload.password) {
            delete payload.password;
        }

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Gagal menyimpan data.');
            }
            if (userToEdit) {
                setUsers(users.map(u => u.id === userToEdit.id ? result : u));
            } else {
                setUsers([...users, result]);
            }
            handleCloseForm();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleShowConfirm = (id) => {
        setUserToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userToDeleteId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Gagal menghapus akun.');
            }
            setUsers(users.filter(u => u.id !== userToDeleteId));
            setShowConfirmPopup(false);
            setUserToDeleteId(null);
        } catch (e) {
            alert(e.message);
            setShowConfirmPopup(false);
        }
    };

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    if (loading) return <div>Loading...</div>;
    
    return (
        <div className="kelola-data-container">
            <div className="table-header">
                <h2>Manajemen Akun Pengguna</h2>
                <div className="header-actions">
                    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} placeholder="Cari username atau peran..." />
                    <button onClick={() => handleOpenForm()} className="add-button">
                        Tambah Akun
                    </button>
                </div>
            </div>
            
            {showForm && (
                <div className="modal-overlay">
                    <form onSubmit={handleSubmit} className="data-form fade-in">
                        <h3>{userToEdit ? 'Edit Akun' : 'Tambah Akun Baru'}</h3>
                        {error && <p className="error-message">{error}</p>}
                        <div className="form-group">
                            <label>Username:</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={isSubmitting} />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required={!userToEdit} disabled={isSubmitting} />
                            {userToEdit && <small className="form-hint">Kosongkan jika tidak ingin mengubah password.</small>}
                        </div>
                        <div className="form-group">
                            <label>Role:</label>
                            <select name="role" value={formData.role} onChange={handleChange} required disabled={isSubmitting}>
                                <option value="Staf TU">Staf TU</option>
                                <option value="Waka Kurikulum">Waka Kurikulum</option>
                                <option value="Kepala Sekolah">Kepala Sekolah</option>
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
                            <th>Username</th>
                            <th>Role</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>{user.username}</td>
                                <td>{user.role}</td>
                                <td className="action-buttons">
                                    <button onClick={() => handleOpenForm(user)} className="edit-button"><FaEdit /> Edit</button>
                                    <button onClick={() => handleShowConfirm(user.id)} className="delete-button"><FaTrash /> Hapus</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus akun ini?"
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirmPopup(false)}
                />
            )}
        </div>
    );
};

export default ManajemenAkun;