// frontend/src/pages/UnggahDataExcel.jsx

import React, { useState, useRef } from 'react';
import './UnggahDataExcel.css';

const UnggahDataExcel = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null); // Ref untuk input file

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Silakan pilih file terlebih dahulu.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            setMessage(result.message);
        } catch (error) {
            setMessage('Terjadi kesalahan saat mengunggah file.');
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current.click(); // Memicu klik pada input file yang tersembunyi
    };

    return (
        <div className="unggah-data-container fade-in">
            <h2>Unggah Data dari Excel</h2>
            <div className="download-section">
                <p>Silakan unduh template Excel di bawah ini untuk memastikan format data Anda benar.</p>
                <a href="http://localhost:3001/api/templates/template-data-master.xlsx" download>
                    <button className="download-button">Unduh Template</button>
                </a>
            </div>
            
            <div className="upload-section">
                <p className="upload-label">Pilih file Excel yang akan diunggah:</p>
                <div className="file-input-wrapper">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }} // Sembunyikan input file bawaan
                    />
                    <button className="browse-button" onClick={handleBrowseClick}>
                        Pilih File
                    </button>
                    <span className="file-name">
                        {file ? file.name : 'Belum ada file yang dipilih.'}
                    </span>
                </div>
                <button onClick={handleUpload} className="upload-button">
                    Unggah
                </button>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default UnggahDataExcel;