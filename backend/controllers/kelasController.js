// backend/controllers/kelasController.js
const db = require('../config/db');

exports.getAllKelas = (req, res) => {
  const sql = 'SELECT * FROM kelas';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error executing GET query:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

exports.addKelas = (req, res) => {
  const { kode_kelas, nama_kelas, tingkat } = req.body;
  const sql = 'INSERT INTO kelas (kode_kelas, nama_kelas, tingkat) VALUES (?, ?, ?)';
  db.query(sql, [kode_kelas, nama_kelas, tingkat], (err, result) => {
    if (err) {
      console.error('Error executing POST query:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

exports.editKelas = (req, res) => {
  const { id } = req.params;
  const { kode_kelas, nama_kelas, tingkat } = req.body;
  const sql = 'UPDATE kelas SET kode_kelas = ?, nama_kelas = ?, tingkat = ? WHERE id = ?';
  db.query(sql, [kode_kelas, nama_kelas, tingkat, id], (err, result) => {
    if (err) {
      console.error('Error executing PUT query:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kelas not found' });
    }
    res.status(200).json({ id: parseInt(id), ...req.body });
  });
};

exports.deleteKelas = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM kelas WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error executing DELETE query:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Kelas not found' });
    }
    res.status(200).json({ message: 'Kelas deleted successfully' });
  });
};