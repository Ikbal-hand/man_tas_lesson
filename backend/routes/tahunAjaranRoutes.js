const express = require('express');
const router = express.Router();
const tahunAjaranController = require('../controllers/tahunAjaranController');

// GET /api/tahun-ajaran/
router.get('/', tahunAjaranController.getAllTahunAjaran);

// POST /api/tahun-ajaran/
router.post('/', tahunAjaranController.addTahunAjaran);

// PUT /api/tahun-ajaran/:id
router.put('/:id', tahunAjaranController.updateTahunAjaran);

// DELETE /api/tahun-ajaran/:id
router.delete('/:id', tahunAjaranController.deleteTahunAjaran);

module.exports = router;