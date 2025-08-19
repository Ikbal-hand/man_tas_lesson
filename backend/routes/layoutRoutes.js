const express = require('express');
const router = express.Router();
const layoutController = require('../controllers/layoutController');

// Rute untuk mengambil tata letak
router.get('/', layoutController.getLayout);

// Rute untuk menyimpan tata letak
router.post('/', layoutController.saveLayout);

module.exports = router;