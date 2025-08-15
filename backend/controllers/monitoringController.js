// backend/controllers/monitoringController.js
const db = require('../config/db');

exports.getCurrentLessons = (req, res) => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = days[today.getDay()];
    const currentTime = today.toTimeString().split(' ')[0];

    const sql = `
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
        WHERE
            jadwal.hari = ? AND ? BETWEEN jadwal.jam_mulai AND jadwal.jam_selesai
    `;
    const params = [currentDay, currentTime];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching current lessons:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};

exports.getNextLesson = (req, res) => {
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const currentDay = days[today.getDay()];
    const currentTime = today.toTimeString().split(' ')[0];

    const sql = `
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
        WHERE
            jadwal.hari = ? AND jadwal.jam_mulai > ?
        ORDER BY
            jadwal.jam_mulai ASC
        LIMIT 1
    `;
    const params = [currentDay, currentTime];

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching next lesson:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results[0] || null); // Mengembalikan objek pertama atau null jika tidak ada
    });
};