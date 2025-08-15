// backend/routes/mataPelajaranRoutes.js
const express = require('express');
const router = express.Router();
const mataPelajaranController = require('../controllers/mataPelajaranController');

// GET semua mata pelajaran
router.get('/', mataPelajaranController.getAllMataPelajaran);
// POST mata pelajaran baru
router.post('/', mataPelajaranController.addMataPelajaran);
// PUT untuk mengedit mata pelajaran berdasarkan ID
router.put('/:id', mataPelajaranController.editMataPelajaran);
// DELETE mata pelajaran berdasarkan ID
router.delete('/:id', mataPelajaranController.deleteMataPelajaran);

module.exports = router;