// backend/routes/kelasRoutes.js
const express = require('express');
const router = express.Router();
const kelasController = require('../controllers/kelasController');

// GET semua kelas
router.get('/', kelasController.getAllKelas);
// POST kelas baru
router.post('/', kelasController.addKelas);
// PUT untuk mengedit kelas berdasarkan ID
router.put('/:id', kelasController.editKelas);
// DELETE kelas berdasarkan ID
router.delete('/:id', kelasController.deleteKelas);

module.exports = router;