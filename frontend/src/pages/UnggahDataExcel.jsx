// frontend/src/pages/UnggahDataExcel.jsx

import React, { useState, useRef } from 'react';
import './UnggahDataExcel.css';
import { FaDownload, FaFileUpload, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const UnggahDataExcel = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState({ message: '', type: '' }); // 'success' or 'error'
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setUploadStatus({ message: '', type: '' });
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus({ message: 'Silakan pilih file terlebih dahulu.', type: 'error' });
            return;
        }

        setIsUploading(true);
        setUploadStatus({ message: '', type: '' });
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) {
                // Tangkap pesan error spesifik dari backend
                throw new Error(result.message || 'Gagal mengunggah file.');
            }
            
            setUploadStatus({ message: result.message, type: 'success' });
            setFile(null); // Kosongkan file setelah berhasil
        } catch (error) {
            setUploadStatus({ message: error.message, type: 'error' });
        } finally {
            setIsUploading(false);
        }
    };

    // Fungsi untuk memicu klik pada input file
    const handleBrowseClick = () => fileInputRef.current.click();

    // Fungsi untuk Drag & Drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            setFile(droppedFile);
            setUploadStatus({ message: '', type: '' });
        }
    };

    return (
        <div className="kelola-data-container">
            <div className="table-header">
                <h2>Unggah Data Master dari Excel</h2>
            </div>
            
            <div className="upload-grid">
                <div className="widget">
                    <h3><FaDownload /> Langkah 1: Unduh Template</h3>
                    <p>Gunakan template ini untuk memastikan format data Anda benar dan proses unggah berjalan lancar.</p>
                    <a href="http://localhost:3001/api/templates/template-data-master.xlsx" download>
                        <button className="download-button">Unduh Template</button>
                    </a>
                </div>
                
                <div className="widget">
                    <h3><FaFileUpload /> Langkah 2: Unggah File</h3>
                    <div 
                        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".xlsx, .xls"
                            style={{ display: 'none' }}
                        />
                        <p>Seret & lepas file di sini, atau</p>
                        <button className="browse-button" onClick={handleBrowseClick}>Pilih File</button>
                    </div>
                    {file && <p className="file-name-display">File terpilih: <strong>{file.name}</strong></p>}
                    <button 
                        onClick={handleUpload} 
                        className="upload-button" 
                        disabled={!file || isUploading}
                    >
                        {isUploading ? 'Mengunggah...' : 'Unggah Sekarang'}
                    </button>
                    {uploadStatus.message && (
                        <div className={`message ${uploadStatus.type}`}>
                            {uploadStatus.type === 'success' ? <FaCheckCircle /> : <FaTimesCircle />}
                            {uploadStatus.message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UnggahDataExcel;