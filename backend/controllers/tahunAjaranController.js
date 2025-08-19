const db = require('../config/db');

// GET - Mengambil semua tahun ajaran
exports.getAllTahunAjaran = async (req, res) => {
    try {
        const [results] = await db.promise().query(
            'SELECT * FROM tahun_ajaran ORDER BY nama_tahun_ajaran DESC'
        );
        res.status(200).json(results || []);
    } catch (error) {
        console.error("Error fetching tahun ajaran:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};

// POST - Menambah tahun ajaran baru
exports.addTahunAjaran = async (req, res) => {
    const { nama_tahun_ajaran, is_active } = req.body;
    if (!nama_tahun_ajaran) {
        return res.status(400).json({ message: 'Nama tahun ajaran wajib diisi.' });
    }

    try {
        // --- PERBAIKAN: Jalankan transaksi langsung pada 'db.promise()' ---
        await db.promise().beginTransaction(); 

        if (is_active) {
            await db.promise().query('UPDATE tahun_ajaran SET is_active = false');
        }

        const [insertResult] = await db.promise().query(
            'INSERT INTO tahun_ajaran (nama_tahun_ajaran, is_active) VALUES (?, ?)',
            [nama_tahun_ajaran, is_active ? 1 : 0]
        );
        
        await db.promise().commit(); 
        
        const newId = insertResult.insertId;
        const [newItem] = await db.promise().query('SELECT * FROM tahun_ajaran WHERE id = ?', [newId]);
        res.status(201).json(newItem[0]);

    } catch (error) {
        await db.promise().rollback(); 
        console.error("Error adding tahun ajaran:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `Nama tahun ajaran '${nama_tahun_ajaran}' sudah ada.` });
        }
        res.status(500).json({ message: "Gagal menambahkan tahun ajaran." });
    } 
    // Blok 'finally' untuk melepaskan koneksi tidak lagi diperlukan di sini
};

// PUT - Mengedit tahun ajaran
exports.updateTahunAjaran = async (req, res) => {
    const { id } = req.params;
    const { nama_tahun_ajaran, is_active } = req.body;
    if (!nama_tahun_ajaran) {
        return res.status(400).json({ message: 'Nama tahun ajaran wajib diisi.' });
    }

    try {
        // --- PERBAIKAN: Jalankan transaksi langsung pada 'db.promise()' ---
        await db.promise().beginTransaction();

        if (is_active) {
            await db.promise().query('UPDATE tahun_ajaran SET is_active = false');
        }

        const [updateResult] = await db.promise().query(
            'UPDATE tahun_ajaran SET nama_tahun_ajaran = ?, is_active = ? WHERE id = ?',
            [nama_tahun_ajaran, is_active ? 1 : 0, id]
        );
        if (updateResult.affectedRows === 0) {
            throw new Error('Tahun ajaran tidak ditemukan.');
        }

        await db.promise().commit();
        
        const [updatedItem] = await db.promise().query('SELECT * FROM tahun_ajaran WHERE id = ?', [id]);
        res.status(200).json(updatedItem[0]);

    } catch (error) {
        await db.promise().rollback();
        console.error("Error updating tahun ajaran:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `Nama tahun ajaran '${nama_tahun_ajaran}' sudah ada.` });
        }
        res.status(500).json({ message: "Gagal mengedit tahun ajaran." });
    }
};

// DELETE - Menghapus tahun ajaran
exports.deleteTahunAjaran = async (req, res) => {
    const { id } = req.params;
    try {
        const [jadwalCount] = await db.promise().query('SELECT COUNT(*) as count FROM jadwal WHERE id_tahun_ajaran = ?', [id]);
        if (jadwalCount[0].count > 0) {
            return res.status(409).json({ message: 'Tidak bisa dihapus, tahun ajaran ini sedang digunakan pada data jadwal.' });
        }
        const [deleteResult] = await db.promise().query('DELETE FROM tahun_ajaran WHERE id = ?', [id]);
        if (deleteResult.affectedRows === 0) {
            return res.status(404).json({ message: 'Tahun ajaran tidak ditemukan.' });
        }
        res.status(200).json({ message: 'Tahun ajaran berhasil dihapus.' });
    } catch (error) {
        console.error("Error deleting tahun ajaran:", error);
        res.status(500).json({ message: "Terjadi kesalahan pada server." });
    }
};