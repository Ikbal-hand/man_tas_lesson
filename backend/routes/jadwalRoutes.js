const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

// Rute untuk jadwal
router.get('/', jadwalController.getAllJadwal);
router.post('/', jadwalController.addJadwal);
router.put('/:id', jadwalController.editJadwal);
router.delete('/:id', jadwalController.deleteJadwal);

// Rute baru untuk mengosongkan jadwal per kelas
router.delete('/kelas/:id_kelas', jadwalController.clearJadwalByKelas);

module.exports = router;