// frontend/src/components/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/image.png'; 

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.user.role === 'Staf TU') {
                    navigate('/staf-tu-dashboard');
                }
                // Anda bisa menambahkan kondisi lain untuk peran Waka Kurikulum dan Kepala Sekolah
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Terjadi kesalahan. Silakan coba lagi.');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form">
                <img src={logo} alt="Logo Aplikasi" className="login-logo" />
                <h1>Sistem Monitoring Guru</h1>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <button type="submit" onClick={handleLogin} className="login-button">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;