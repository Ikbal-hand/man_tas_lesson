// backend/controllers/penugasanController.js

const db = require('../config/db');

exports.getAllPenugasan = (req, res) => {
    const sql = `
        SELECT 
            pg.id,
            g.nama AS nama_guru,
            mp.nama_mapel,
            k.nama_kelas
        FROM penugasan_guru pg
        LEFT JOIN guru g ON pg.id_guru = g.id
        JOIN mata_pelajaran mp ON pg.id_mata_pelajaran = mp.id
        JOIN kelas k ON pg.id_kelas = k.id
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching penugasan:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(result);
    });
};

exports.addPenugasan = (req, res) => {
    const { id_guru, id_mata_pelajaran, id_kelas } = req.body;
    const sql = `
        INSERT INTO penugasan_guru (id_guru, id_mata_pelajaran, id_kelas)
        VALUES (?, ?, ?)
    `;
    const guruId = id_guru === '' ? null : id_guru;
    db.query(sql, [guruId, id_mata_pelajaran, id_kelas], (err, result) => {
        if (err) {
            console.error('Error adding penugasan:', err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, ...req.body });
    });
};

exports.deletePenugasan = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM penugasan_guru WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting penugasan:', err);
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Penugasan not found' });
        }
        res.status(200).json({ message: 'Penugasan deleted successfully' });
    });
};