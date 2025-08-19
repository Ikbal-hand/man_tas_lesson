const express = require('express');
const router = express.Router();
const penugasanController = require('../controllers/penugasanController');

router.get('/', penugasanController.getAllPenugasan);
router.post('/', penugasanController.addPenugasan);
router.delete('/:id', penugasanController.deletePenugasan);

module.exports = router;