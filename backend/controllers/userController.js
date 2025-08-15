// backend/controllers/userController.js
const db = require('../config/db');

exports.getAllUsers = (req, res) => {
  const sql = 'SELECT id, username, role FROM users';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error executing GET query:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(result);
  });
};

exports.addUser = (req, res) => {
  const { username, password, role } = req.body;
  const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
  db.query(sql, [username, password, role], (err, result) => {
    if (err) {
      console.error('Error executing POST query:', err);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...req.body });
  });
};

exports.editUser = (req, res) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  let sql;
  let params;

  // Jika password diubah
  if (password) {
    sql = 'UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?';
    params = [username, password, role, id];
  } else {
    sql = 'UPDATE users SET username = ?, role = ? WHERE id = ?';
    params = [username, role, id];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error executing PUT query:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ id: parseInt(id), ...req.body });
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error executing DELETE query:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  });
};