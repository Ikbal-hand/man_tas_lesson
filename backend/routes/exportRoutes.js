// backend/routes/exportRoutes.js
const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');

// GET untuk mengekspor file Excel
router.get('/', exportController.exportJadwal);
// GET untuk pratinjau data dalam format JSON
router.get('/preview', exportController.previewJadwal);

module.exports = router;