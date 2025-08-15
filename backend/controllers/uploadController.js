// backend/controllers/uploadController.js
const db = require('../config/db');
const xlsx = require('xlsx');

exports.uploadData = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        
        // Memproses sheet untuk data Guru
        const guruSheet = workbook.Sheets['Data Guru'];
        const guruData = xlsx.utils.sheet_to_json(guruSheet);
        
        // Memproses sheet untuk data Mata Pelajaran
        const mapelSheet = workbook.Sheets['Data Mata Pelajaran'];
        const mapelData = xlsx.utils.sheet_to_json(mapelSheet);
        
        // Memproses sheet untuk data Kelas
        const kelasSheet = workbook.Sheets['Data Kelas'];
        const kelasData = xlsx.utils.sheet_to_json(kelasSheet);

        const guruSql = 'INSERT INTO guru (nip, nama, kode_guru) VALUES ?';
        const guruValues = guruData.map(row => [row.nip, row.nama, row.kode_guru]);
        await db.query(guruSql, [guruValues]);

        const mapelSql = 'INSERT INTO mata_pelajaran (kode_mapel, nama_mapel, jenjang_kelas) VALUES ?';
        const mapelValues = mapelData.map(row => [row.kode_mapel, row.nama_mapel, row.jenjang_kelas]);
        await db.query(mapelSql, [mapelValues]);

        const kelasSql = 'INSERT INTO kelas (kode_kelas, nama_kelas, tingkat) VALUES ?';
        const kelasValues = kelasData.map(row => [row.kode_kelas, row.nama_kelas, row.tingkat]);
        await db.query(kelasSql, [kelasValues]);
        
        res.status(200).json({ message: 'Data berhasil diunggah dan disimpan.' });
    } catch (error) {
        console.error('Error processing upload:', error);
        res.status(500).json({ message: 'Error processing upload.', error: error.message });
    }
};