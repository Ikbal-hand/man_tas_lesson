// backend/controllers/jadwalController.js

const db = require('../config/db');

// GET: Mengambil semua jadwal untuk tahun ajaran tertentu
exports.getAllJadwal = (req, res) => {
    const idTahunAjaran = req.query.tahun_ajaran;
    if (!idTahunAjaran) {
        return res.status(400).json({ message: 'Parameter query "tahun_ajaran" dibutuhkan.' });
    }

    // PERBAIKAN: JOIN kelas k ON j.id_kelas = k.id
    const sql = `
        SELECT 
            j.id, j.hari, j.jam_ke, j.jam_mulai, j.jam_selesai, j.id_tahun_ajaran,
            p.id AS id_penugasan,
            g.id AS id_guru, g.nama AS nama_guru,
            mp.id AS id_mata_pelajaran, mp.nama_mapel,
            k.id AS id_kelas, k.nama_kelas, k.tingkat
        FROM jadwal j
        JOIN penugasan_guru p ON j.id_penugasan = p.id
        JOIN kelas k ON j.id_kelas = k.id  -- <-- Perbaikan join di sini
        JOIN guru g ON p.id_guru = g.id
        JOIN mata_pelajaran mp ON p.id_mata_pelajaran = mp.id
        WHERE j.id_tahun_ajaran = ?
        ORDER BY j.hari, j.jam_ke, k.nama_kelas
    `;

    db.query(sql, [idTahunAjaran], (err, result) => {
        if (err) {
            console.error('Error fetching all jadwal:', err);
            return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
        }
        res.status(200).json(result || []);
    });
};

// POST: Menambah jadwal baru
exports.addJadwal = async (req, res) => {
    const { id_penugasan, id_kelas, hari, jam_ke, jam_mulai, jam_selesai, id_tahun_ajaran } = req.body;
    if (!id_penugasan || !id_kelas || !hari || !jam_ke || !jam_mulai || !jam_selesai || !id_tahun_ajaran) {
        return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    try {
        const [penugasanResult] = await db.promise().query('SELECT id_guru FROM penugasan_guru WHERE id = ?', [id_penugasan]);
        if (penugasanResult.length === 0) {
            return res.status(404).json({ message: 'Penugasan tidak ditemukan.' });
        }
        const { id_guru } = penugasanResult[0];

        const [konflikResult] = await db.promise().query(
            `SELECT j.id FROM jadwal j JOIN penugasan_guru p ON j.id_penugasan = p.id WHERE j.hari = ? AND j.id_tahun_ajaran = ? AND (p.id_guru = ? OR j.id_kelas = ?) AND (? < j.jam_selesai AND ? > j.jam_mulai) LIMIT 1`,
            [hari, id_tahun_ajaran, id_guru, id_kelas, jam_mulai, jam_selesai]
        );
        if (konflikResult.length > 0) {
            return res.status(409).json({ message: 'Konflik jadwal: Guru atau kelas sudah ada jadwal pada waktu yang sama.' });
        }

        const [insertResult] = await db.promise().query(
            'INSERT INTO jadwal (id_penugasan, id_kelas, hari, jam_ke, jam_mulai, jam_selesai, id_tahun_ajaran) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_penugasan, id_kelas, hari, jam_ke, jam_mulai, jam_selesai, id_tahun_ajaran]
        );

        const newJadwalId = insertResult.insertId;
        const [newJadwal] = await db.promise().query(`
            SELECT j.id, j.hari, j.jam_ke, j.jam_mulai, j.jam_selesai, p.id AS id_penugasan, g.nama AS nama_guru, mp.nama_mapel, k.nama_kelas, k.id AS id_kelas, j.id_tahun_ajaran
            FROM jadwal j JOIN penugasan_guru p ON j.id_penugasan = p.id JOIN guru g ON p.id_guru = g.id JOIN mata_pelajaran mp ON p.id_mata_pelajaran = mp.id JOIN kelas k ON j.id_kelas = k.id
            WHERE j.id = ?`, [newJadwalId]);

        res.status(201).json(newJadwal[0]);
    } catch (err) {
        console.error('Error adding jadwal:', err);
        return res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// PUT: Mengedit jadwal
exports.editJadwal = async (req, res) => {
    const { id } = req.params;
    const { id_penugasan, id_kelas, hari, jam_ke, jam_mulai, jam_selesai, id_tahun_ajaran } = req.body;

    try {
        const [penugasanResult] = await db.promise().query('SELECT id_guru FROM penugasan_guru WHERE id = ?', [id_penugasan]);
        if (penugasanResult.length === 0) return res.status(404).json({ message: 'Penugasan tidak ditemukan.' });
        const { id_guru } = penugasanResult[0];

        const [konflikResult] = await db.promise().query(
            `SELECT j.id FROM jadwal j JOIN penugasan_guru p ON j.id_penugasan = p.id WHERE j.id != ? AND j.hari = ? AND j.id_tahun_ajaran = ? AND (p.id_guru = ? OR j.id_kelas = ?) AND (? < j.jam_selesai AND ? > jam_mulai) LIMIT 1`,
            [id, hari, id_tahun_ajaran, id_guru, id_kelas, jam_mulai, jam_selesai]
        );
        if (konflikResult.length > 0) return res.status(409).json({ message: 'Konflik jadwal terdeteksi.' });

        await db.promise().query(
            'UPDATE jadwal SET id_penugasan = ?, id_kelas = ?, hari = ?, jam_ke = ?, jam_mulai = ?, jam_selesai = ?, id_tahun_ajaran = ? WHERE id = ?',
            [id_penugasan, id_kelas, hari, jam_ke, jam_mulai, jam_selesai, id_tahun_ajaran, id]
        );

        const [updatedJadwal] = await db.promise().query(`
            SELECT j.id, j.hari, j.jam_ke, /* ... semua kolom ... */
            FROM jadwal j /* ... semua JOIN ... */
            WHERE j.id = ?`, [id]);
            
        res.status(200).json(updatedJadwal[0]);
    } catch (err) {
        console.error('Error editing jadwal:', err);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE: Menghapus jadwal
exports.deleteJadwal = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.promise().query('DELETE FROM jadwal WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Jadwal tidak ditemukan.' });
        res.status(200).json({ message: 'Jadwal berhasil dihapus.' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

// DELETE: Mengosongkan jadwal per kelas
exports.clearJadwalByKelas = async (req, res) => {
    const { id_kelas } = req.params;
    const { hari, tahun_ajaran } = req.query;
    if (!hari || !tahun_ajaran) return res.status(400).json({ message: 'Parameter "hari" dan "tahun_ajaran" dibutuhkan.' });
    try {
        await db.promise().query('DELETE FROM jadwal WHERE id_kelas = ? AND hari = ? AND id_tahun_ajaran = ?', [id_kelas, hari, tahun_ajaran]);
        res.status(200).json({ message: `Jadwal berhasil dikosongkan.` });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};