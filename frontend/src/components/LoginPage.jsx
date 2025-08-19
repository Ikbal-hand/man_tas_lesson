import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/image.png'; // Pastikan path ke logo Anda benar

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Simpan status login dan info pengguna ke localStorage
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('username', data.user.username); // Asumsi backend mengirim username

                // Arahkan berdasarkan peran (role)
                if (data.user.role === 'Staf TU') {
                    navigate('/dashboard-staf-tu');
                } else if (data.user.role === 'Waka Kurikulum') {
                    navigate('/dashboard-waka');
                } else if (data.user.role === 'Kepala Sekolah') {
                    navigate('/dashboard-kepala-sekolah');
                } else {
                    setError('Peran pengguna tidak dikenali.');
                }
            } else {
                setError(data.message || 'Username atau password salah.');
            }
        } catch (err) {
            setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <form className="login-form" onSubmit={handleLogin}>
                <img src={logo} alt="Logo MAN 2 Tasikmalaya" className="login-logo" />
                <div className="login-header">
                    <h1>Sistem Monitoring Guru</h1>
                    <p>MAN 2 TASIKMALAYA</p>
                </div>
                
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Masukkan username"
                        required
                        disabled={loading}
                    />
                </div>
                
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Masukkan password"
                        required
                        disabled={loading}
                    />
                </div>
                
                {error && <p className="error-message">{error}</p>}
                
                <button type="submit" className="login-button" disabled={loading}>
                    {loading ? 'Memproses...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginPage;