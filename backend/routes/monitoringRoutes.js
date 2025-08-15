// backend/routes/monitoringRoutes.js
const express = require('express');
const router = express.Router();
const monitoringController = require('../controllers/monitoringController');

// GET untuk mengambil data guru yang sedang mengajar
router.get('/current', monitoringController.getCurrentLessons);

// GET untuk mengambil data jadwal berikutnya
router.get('/next', monitoringController.getNextLesson);

module.exports = router;