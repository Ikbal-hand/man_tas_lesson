// backend/controllers/jadwalController.js
const db = require('../config/db');

exports.getAllJadwal = (req, res) => {
    const sql = `
        SELECT 
            j.id, j.hari, j.jam_ke, j.jam_mulai, j.jam_selesai,
            pg.id AS id_penugasan,
            g.id AS id_guru, g.nama AS nama_guru,
            mp.id AS id_mata_pelajaran, mp.nama_mapel,
            k.id AS id_kelas, k.nama_kelas, k.tingkat
        FROM jadwal j
        JOIN penugasan_guru pg ON j.id_penugasan = pg.id
        JOIN guru g ON pg.id_guru = g.id
        JOIN mata_pelajaran mp ON pg.id_mata_pelajaran = mp.id
        JOIN kelas k ON pg.id_kelas = k.id
        ORDER BY j.hari, j.jam_ke, k.nama_kelas
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching all jadwal:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(result);
    });
};

exports.addJadwal = async (req, res) => {
    const { id_penugasan, hari, jam_ke, jam_mulai, jam_selesai } = req.body;

    const [penugasanResult] = await db.promise().query('SELECT id_guru, id_kelas FROM penugasan_guru WHERE id = ?', [id_penugasan]);
    if (penugasanResult.length === 0) {
        return res.status(404).json({ message: 'Penugasan tidak ditemukan.' });
    }
    const { id_guru, id_kelas } = penugasanResult[0];

    const konflikSql = `
        SELECT COUNT(*) as count FROM jadwal j
        JOIN penugasan_guru pg ON j.id_penugasan = pg.id
        WHERE j.hari = ? AND 
        (
            (pg.id_guru = ?) OR (pg.id_kelas = ?)
        ) AND
        (
            (j.jam_mulai >= ? AND j.jam_mulai < ?) OR
            (j.jam_selesai > ? AND j.jam_selesai <= ?) OR
            (? >= j.jam_mulai AND ? < j.jam_selesai)
        )
    `;
    const konflikParams = [hari, id_guru, id_kelas, jam_mulai, jam_selesai, jam_mulai, jam_selesai, jam_mulai, jam_selesai];

    try {
        const [konflikResult] = await db.promise().query(konflikSql, konflikParams);
        if (konflikResult[0].count > 0) {
            return res.status(409).json({ message: 'Konflik jadwal terdeteksi: Guru atau kelas bentrok pada waktu yang sama.' });
        }
    } catch (err) {
        console.error('Error checking for conflict:', err);
        return res.status(500).json({ error: err.message });
    }

    const sql = `
        INSERT INTO jadwal (id_penugasan, hari, jam_ke, jam_mulai, jam_selesai) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const params = [id_penugasan, hari, jam_ke, jam_mulai, jam_selesai];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error adding jadwal:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, ...req.body });
    });
};

exports.editJadwal = async (req, res) => {
    const { id } = req.params;
    const { id_penugasan, hari, jam_ke, jam_mulai, jam_selesai } = req.body;

    const [penugasanResult] = await db.promise().query('SELECT id_guru, id_kelas FROM penugasan_guru WHERE id = ?', [id_penugasan]);
    if (penugasanResult.length === 0) {
        return res.status(404).json({ message: 'Penugasan tidak ditemukan.' });
    }
    const { id_guru, id_kelas } = penugasanResult[0];

    const konflikSql = `
        SELECT COUNT(*) as count FROM jadwal j
        JOIN penugasan_guru pg ON j.id_penugasan = pg.id
        WHERE j.id != ? AND j.hari = ? AND
        (
            (pg.id_guru = ?) OR (pg.id_kelas = ?)
        ) AND
        (
            (j.jam_mulai >= ? AND j.jam_mulai < ?) OR
            (j.jam_selesai > ? AND j.jam_selesai <= ?) OR
            (? >= j.jam_mulai AND ? < j.jam_selesai)
        )
    `;
    const konflikParams = [id, hari, id_guru, id_kelas, jam_mulai, jam_selesai, jam_mulai, jam_selesai, jam_mulai, jam_selesai];

    try {
        const [konflikResult] = await db.promise().query(konflikSql, konflikParams);
        if (konflikResult[0].count > 0) {
            return res.status(409).json({ message: 'Konflik jadwal terdeteksi: Guru atau kelas bentrok pada waktu yang sama.' });
        }
    } catch (err) {
        console.error('Error checking for conflict:', err);
        return res.status(500).json({ error: err.message });
    }

    const sql = `
        UPDATE jadwal SET id_penugasan = ?, hari = ?, jam_ke = ?, jam_mulai = ?, jam_selesai = ?
        WHERE id = ?
    `;
    const params = [id_penugasan, hari, jam_ke, jam_mulai, jam_selesai, id];

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Error editing jadwal:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Jadwal not found' });
        }
        res.status(200).json({ id: parseInt(id), ...req.body });
    });
};

exports.deleteJadwal = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM jadwal WHERE id = ?';

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting jadwal:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Jadwal not found' });
        }
        res.status(200).json({ message: 'Jadwal deleted successfully' });
    });
};

exports.getKonflikJadwal = (req, res) => {
    const sql = `
        SELECT
            j1.id, 
            g1.nama AS guru_1, 
            k1.nama_kelas AS kelas_1, 
            j1.hari, j1.jam_mulai, j1.jam_selesai,
            g2.nama AS guru_2, 
            k2.nama_kelas AS kelas_2
        FROM jadwal j1
        JOIN jadwal j2 ON j1.id < j2.id AND j1.hari = j2.hari
        JOIN penugasan_guru pg1 ON j1.id_penugasan = pg1.id
        JOIN penugasan_guru pg2 ON j2.id_penugasan = pg2.id
        JOIN guru g1 ON pg1.id_guru = g1.id
        JOIN guru g2 ON pg2.id_guru = g2.id
        JOIN kelas k1 ON pg1.id_kelas = k1.id
        JOIN kelas k2 ON pg2.id_kelas = k2.id
        WHERE
            g1.id = g2.id OR k1.id = k2.id
        ORDER BY j1.hari, j1.jam_mulai
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching conflicts:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(results);
    });
};