// frontend/src/pages/ManajemenAkun.jsx

import React, { useState, useEffect } from 'react';
import './ManajemenAkun.css'; // File CSS baru
import ConfirmPopup from '../components/ConfirmPopup';

const ManajemenAkun = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'Staf TU' });
    const [showForm, setShowForm] = useState(false);
    const [userToEdit, setUserToEdit] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);
    const [userToDeleteId, setUserToDeleteId] = useState(null);

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/users');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
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

    const handleEditClick = (user) => {
        setUserToEdit(user);
        setFormData({ username: user.username, password: '', role: user.role });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const url = userToEdit
            ? `http://localhost:3001/api/users/${userToEdit.id}`
            : 'http://localhost:3001/api/users';
        
        const method = userToEdit ? 'PUT' : 'POST';

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

            fetchUsers();
            setFormData({ username: '', password: '', role: 'Staf TU' });
            setUserToEdit(null);
            setShowForm(false);
        } catch (e) {
            setError(e.message);
        }
    };

    const handleShowConfirm = (id) => {
        setUserToDeleteId(id);
        setShowConfirmPopup(true);
    };

    const handleCancelDelete = () => {
        setShowConfirmPopup(false);
        setUserToDeleteId(null);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3001/api/users/${userToDeleteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchUsers();
            setShowConfirmPopup(false);
            setUserToDeleteId(null);
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
        <div className="manajemen-akun-container fade-in">
            <div className="table-header">
                <h2>Daftar Akun Pengguna</h2>
                <button onClick={() => { setShowForm(!showForm); setUserToEdit(null); }} className="add-button">
                    {showForm ? 'Tutup Formulir' : 'Tambah Akun'}
                </button>
            </div>
            
            {showForm && (
                <form onSubmit={handleSubmit} className="akun-form fade-in">
                    <h3>{userToEdit ? 'Edit Akun' : 'Tambah Akun Baru'}</h3>
                    <div className="form-group">
                        <label>Username:</label>
                        <input type="text" name="username" value={formData.username} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password:</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required={!userToEdit} />
                        {userToEdit && <small>Kosongkan jika tidak ingin mengubah password.</small>}
                    </div>
                    <div className="form-group">
                        <label>Role:</label>
                        <select name="role" value={formData.role} onChange={handleChange} required>
                            <option value="Staf TU">Staf TU</option>
                            <option value="Waka Kurikulum">Waka Kurikulum</option>
                            <option value="Kepala Sekolah">Kepala Sekolah</option>
                        </select>
                    </div>
                    <button type="submit" className="submit-button">Simpan</button>
                    <button type="button" onClick={() => setShowForm(false)} className="cancel-button">Batal</button>
                </form>
            )}

            <table className="akun-table fade-in">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.username}</td>
                            <td>{user.role}</td>
                            <td>
                                <button onClick={() => handleEditClick(user)} className="edit-button">Edit</button>
                                <button onClick={() => handleShowConfirm(user.id)} className="delete-button">Hapus</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showConfirmPopup && (
                <ConfirmPopup
                    message="Apakah Anda yakin ingin menghapus akun ini?"
                    onConfirm={handleDelete}
                    onCancel={handleCancelDelete}
                />
            )}
        </div>
    );
};

export default ManajemenAkun;