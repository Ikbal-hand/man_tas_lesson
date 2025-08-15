// backend/controllers/guruController.js
const db = require('../config/db');

exports.getAllGurus = (req, res) => {
  const sql = 'SELECT * FROM guru';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(result);
  });
};

exports.addGuru = (req, res) => {
  const { nip, nama, kode_guru } = req.body;
  const sql = 'INSERT INTO guru (nip, nama, kode_guru) VALUES (?, ?, ?)';
  db.query(sql, [nip, nama, kode_guru], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

exports.editGuru = (req, res) => {
  const { id } = req.params;
  const { nip, nama, kode_guru } = req.body;
  const sql = 'UPDATE guru SET nip = ?, nama = ?, kode_guru = ? WHERE id = ?';
  db.query(sql, [nip, nama, kode_guru, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guru not found' });
    }
    res.status(200).json({ id: parseInt(id), ...req.body });
  });
};

exports.deleteGuru = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM guru WHERE id = ?';
  db.query(sql, [id], (err, result) => {

    if (err) {
      console.error('Error executing DELETE query:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log('DELETE query result:', result);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Guru not found' });
    }
    res.status(200).json({ message: 'Guru deleted successfully' });
  });

};