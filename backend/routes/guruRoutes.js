// backend/routes/guruRoutes.js
const express = require('express');
const router = express.Router();
const guruController = require('../controllers/guruController');

router.get('/', guruController.getAllGurus);
router.post('/', guruController.addGuru);
router.put('/:id', guruController.editGuru);
router.delete('/:id', guruController.deleteGuru);

module.exports = router;