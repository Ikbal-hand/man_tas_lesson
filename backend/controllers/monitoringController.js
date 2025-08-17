// backend/controllers/monitoringController.js
const db = require('../config/db');

// Fungsi pembantu untuk mengambil data dari database
const getLessonData = (currentDay, currentTime) => {
    return new Promise((resolve, reject) => {
        let sql = `
            SELECT
                j.hari, j.jam_mulai, j.jam_selesai, j.jam_ke,
                g.nama AS nama_guru,
                k.nama_kelas,
                mp.nama_mapel
            FROM
                jadwal j
            JOIN
                penugasan_guru pg ON j.id_penugasan = pg.id
            JOIN
                guru g ON pg.id_guru = g.id
            JOIN
                kelas k ON pg.id_kelas = k.id
            JOIN
                mata_pelajaran mp ON pg.id_mata_pelajaran = mp.id
            WHERE 1=1
        `;
        const params = [];

        if (currentDay) {
            sql += ' AND j.hari = ?';
            params.push(currentDay);
        }
        if (currentTime) {
            sql += ' AND ? BETWEEN j.jam_mulai AND j.jam_selesai';
            params.push(currentTime);
        }

        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Fungsi untuk mendapatkan pelajaran yang sedang berlangsung
exports.getCurrentLessons = async (req, res) => {
    try {
        const today = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const currentDay = days[today.getDay()];
        const currentTime = today.toTimeString().split(' ')[0];

        const results = await getLessonData(currentDay, currentTime);
        res.status(200).json(results);
    } catch (e) {
        console.error('Error fetching current lessons:', e);
        res.status(500).json({ error: e.message });
    }
};

// Fungsi untuk mendapatkan pelajaran berikutnya
exports.getNextLesson = async (req, res) => {
    try {
        const today = new Date();
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const currentDay = days[today.getDay()];
        const currentTime = today.toTimeString().split(' ')[0];

        const sql = `
            SELECT
                j.hari, j.jam_mulai, j.jam_selesai, j.jam_ke,
                g.nama AS nama_guru,
                k.nama_kelas,
                mp.nama_mapel
            FROM
                jadwal j
            JOIN
                penugasan_guru pg ON j.id_penugasan = pg.id
            JOIN
                guru g ON pg.id_guru = g.id
            JOIN
                kelas k ON pg.id_kelas = k.id
            JOIN
                mata_pelajaran mp ON pg.id_mata_pelajaran = mp.id
            WHERE
                j.hari = ? AND j.jam_mulai > ?
            ORDER BY
                j.jam_mulai ASC
            LIMIT 1
        `;
        const params = [currentDay, currentTime];

        const [results] = await db.promise().query(sql, params);
        res.status(200).json(results[0] || null);
    } catch (e) {
        console.error('Error fetching next lesson:', e);
        res.status(500).json({ error: e.message });
    }
};