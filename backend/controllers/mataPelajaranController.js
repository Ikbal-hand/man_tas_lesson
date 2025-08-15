// backend/controllers/mataPelajaranController.js
const db = require('../config/db');

exports.getAllMataPelajaran = (req, res) => {
  const sql = 'SELECT * FROM mata_pelajaran';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error executing GET query:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

exports.addMataPelajaran = (req, res) => {
  const { kode_mapel, nama_mapel, jenjang_kelas } = req.body;
  const sql = 'INSERT INTO mata_pelajaran (kode_mapel, nama_mapel, jenjang_kelas) VALUES (?, ?, ?)';
  db.query(sql, [kode_mapel, nama_mapel, jenjang_kelas], (err, result) => {
    if (err) {
      console.error('Error executing POST query:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

exports.editMataPelajaran = (req, res) => {
  const { id } = req.params;
  const { kode_mapel, nama_mapel, jenjang_kelas } = req.body;
  const sql = 'UPDATE mata_pelajaran SET kode_mapel = ?, nama_mapel = ?, jenjang_kelas = ? WHERE id = ?';
  db.query(sql, [kode_mapel, nama_mapel, jenjang_kelas, id], (err, result) => {
    if (err) {
      console.error('Error executing PUT query:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mata pelajaran not found' });
    }
    res.status(200).json({ id: parseInt(id), ...req.body });
  });
};

exports.deleteMataPelajaran = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM mata_pelajaran WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error executing DELETE query:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Mata pelajaran not found' });
    }
    res.status(200).json({ message: 'Mata pelajaran deleted successfully' });
  });
};