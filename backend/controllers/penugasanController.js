const db = require('../config/db');

// GET: Mengambil semua data penugasan dengan nama guru dan mapel
exports.getAllPenugasan = async (req, res) => {
    try {
        const sql = `
            SELECT 
                p.id,
                g.nama AS nama_guru,
                mp.nama_mapel
            FROM penugasan_guru p
            JOIN guru g ON p.id_guru = g.id
            JOIN mata_pelajaran mp ON p.id_mata_pelajaran = mp.id
            ORDER BY g.nama, mp.nama_mapel;
        `;
        const [results] = await db.promise().query(sql);
        // Pastikan selalu mengembalikan array
        res.status(200).json(results || []);
    } catch (error) {
        console.error("Error fetching penugasan:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server saat mengambil data penugasan." });
    }
};

// POST: Menambah penugasan baru
exports.addPenugasan = async (req, res) => {
    const { id_guru, id_mata_pelajaran } = req.body;
    if (!id_guru || !id_mata_pelajaran) {
        return res.status(400).json({ message: 'Guru dan Mata Pelajaran wajib dipilih.' });
    }

    try {
        const [existing] = await db.promise().query(
            'SELECT id FROM penugasan_guru WHERE id_guru = ? AND id_mata_pelajaran = ?',
            [id_guru, id_mata_pelajaran]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Penugasan untuk guru dan mata pelajaran ini sudah ada.' });
        }

        const [insertResult] = await db.promise().query(
            'INSERT INTO penugasan_guru (id_guru, id_mata_pelajaran) VALUES (?, ?)',
            [id_guru, id_mata_pelajaran]
        );
        
        const newId = insertResult.insertId;
        const [newPenugasan] = await db.promise().query(`
            SELECT p.id, g.nama AS nama_guru, mp.nama_mapel 
            FROM penugasan_guru p 
            JOIN guru g ON p.id_guru = g.id 
            JOIN mata_pelajaran mp ON p.id_mata_pelajaran = mp.id 
            WHERE p.id = ?`, [newId]);

        res.status(201).json(newPenugasan[0]);
    } catch (error) {
        console.error("Error adding penugasan:", error);
        res.status(500).json({ message: "Gagal menyimpan penugasan." });
    }
};

// DELETE: Menghapus penugasan
exports.deletePenugasan = async (req, res) => {
    const { id } = req.params;
    try {
        const [jadwalCount] = await db.promise().query(
            'SELECT COUNT(*) as count FROM jadwal WHERE id_penugasan = ?',
            [id]
        );
        if (jadwalCount[0].count > 0) {
            return res.status(409).json({ message: 'Tidak bisa menghapus, penugasan ini sedang digunakan pada jadwal.' });
        }

        const [deleteResult] = await db.promise().query('DELETE FROM penugasan_guru WHERE id = ?', [id]);
        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Penugasan tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Penugasan berhasil dihapus.' });
    } catch (error) {
        console.error("Error deleting penugasan:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};