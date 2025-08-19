const db = require('../config/db');

// GET: Mengambil tata letak untuk tahun ajaran tertentu
exports.getLayout = async (req, res) => {
    const { tahun_ajaran } = req.query;
    if (!tahun_ajaran) {
        return res.status(400).json({ message: 'Parameter tahun_ajaran dibutuhkan.' });
    }

    try {
        const [rows] = await db.promise().query(
            'SELECT struktur_json FROM tata_letak_jadwal WHERE id_tahun_ajaran = ?',
            [tahun_ajaran]
        );

        if (rows.length > 0) {
            // Kirim data JSON yang sudah di-parse dari format TEXT
            res.json(JSON.parse(rows[0].struktur_json)); 
        } else {
            // Kirim 404 jika tidak ada layout tersimpan, frontend akan gunakan default
            res.status(404).json({ message: 'Tidak ada tata letak tersimpan untuk tahun ajaran ini.' });
        }
    } catch (err) {
        console.error("Error fetching layout:", err);
        res.status(500).json({ message: 'Kesalahan pada server.' });
    }
};

// POST: Menyimpan (membuat baru atau update) tata letak
exports.saveLayout = async (req, res) => {
    const { id_tahun_ajaran, struktur_json } = req.body;
    if (!id_tahun_ajaran || !struktur_json) {
        return res.status(400).json({ message: 'Data tidak lengkap.' });
    }

    try {
        const jsonData = JSON.stringify(struktur_json); // Konversi array ke string JSON

        // Logika "UPSERT": UPDATE jika ada, INSERT jika tidak ada.
        const [existing] = await db.promise().query(
            'SELECT id FROM tata_letak_jadwal WHERE id_tahun_ajaran = ?',
            [id_tahun_ajaran]
        );

        if (existing.length > 0) {
            // Jika sudah ada, lakukan UPDATE
            await db.promise().query(
                'UPDATE tata_letak_jadwal SET struktur_json = ? WHERE id_tahun_ajaran = ?',
                [jsonData, id_tahun_ajaran]
            );
        } else {
            // Jika belum ada, lakukan INSERT
            await db.promise().query(
                'INSERT INTO tata_letak_jadwal (id_tahun_ajaran, struktur_json) VALUES (?, ?)',
                [id_tahun_ajaran, jsonData]
            );
        }

        res.status(200).json({ message: 'Tata letak berhasil disimpan.' });

    } catch (err) {
        console.error("Error saving layout:", err);
        res.status(500).json({ message: 'Gagal menyimpan tata letak.' });
    }
};