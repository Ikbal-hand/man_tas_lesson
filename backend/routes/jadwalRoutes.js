// backend/routes/jadwalRoutes.js
const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

router.get('/', jadwalController.getAllJadwal);
router.post('/', jadwalController.addJadwal);
router.put('/:id', jadwalController.editJadwal);
router.delete('/:id', jadwalController.deleteJadwal);
router.get('/konflik', jadwalController.getKonflikJadwal);

module.exports = router;