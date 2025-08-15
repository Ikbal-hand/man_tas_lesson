// backend/controllers/exportController.js
const db = require('../config/db');
const ExcelJS = require('exceljs');

// Fungsi untuk mendapatkan data jadwal dari database.
// Kita akan menggunakan ini untuk pratinjau dan ekspor.
const getJadwalData = (guru, hari, kelas) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT
                jadwal.hari, jadwal.jam_mulai, jadwal.jam_selesai, jadwal.jam_ke,
                guru.nama AS nama_guru,
                kelas.nama_kelas,
                mata_pelajaran.nama_mapel
            FROM
                jadwal
            JOIN
                guru ON jadwal.id_guru = guru.id
            JOIN
                kelas ON jadwal.id_kelas = kelas.id
            JOIN
                mata_pelajaran ON jadwal.id_mata_pelajaran = mata_pelajaran.id
            WHERE 1=1
        `;
        const params = [];

        if (guru) {
            sql += ' AND guru.nama = ?';
            params.push(guru);
        }
        if (hari) {
            sql += ' AND jadwal.hari = ?';
            params.push(hari);
        }
        if (kelas) {
            sql += ' AND kelas.nama_kelas = ?';
            params.push(kelas);
        }

        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Fungsi untuk mengekspor data ke Excel
exports.exportJadwal = async (req, res) => {
    try {
        const { guru, hari, kelas } = req.query;
        const results = await getJadwalData(guru, hari, kelas);
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Jadwal Pelajaran');

        worksheet.columns = [
            { header: 'Hari', key: 'hari', width: 15 },
            { header: 'Jam ke', key: 'jam_ke', width: 10 },
            { header: 'Waktu', key: 'waktu', width: 20 },
            { header: 'Guru', key: 'nama_guru', width: 30 },
            { header: 'Mata Pelajaran', key: 'nama_mapel', width: 30 },
            { header: 'Kelas', key: 'nama_kelas', width: 15 },
        ];

        results.forEach(row => {
            worksheet.addRow({
                hari: row.hari,
                jam_ke: row.jam_ke,
                waktu: `${row.jam_mulai.slice(0, 5)} - ${row.jam_selesai.slice(0, 5)}`,
                nama_guru: row.nama_guru,
                nama_mapel: row.nama_mapel,
                nama_kelas: row.nama_kelas
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + 'jadwal_pelajaran.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting jadwal:', error);
        res.status(500).json({ error: error.message });
    }
};

// Fungsi untuk pratinjau data (mengembalikan JSON)
exports.previewJadwal = async (req, res) => {
    try {
        const { guru, hari, kelas } = req.query;
        const results = await getJadwalData(guru, hari, kelas);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching preview jadwal:', error);
        res.status(500).json({ error: error.message });
    }
};