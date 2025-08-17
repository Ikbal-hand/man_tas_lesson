// backend/routes/penugasanRoutes.js
const express = require('express');
const router = express.Router();
const penugasanController = require('../controllers/penugasanController');

// GET semua penugasan guru
router.get('/', penugasanController.getAllPenugasan);
// POST penugasan baru
router.post('/', penugasanController.addPenugasan);
// DELETE penugasan berdasarkan ID
router.delete('/:id', penugasanController.deletePenugasan);

module.exports = router;