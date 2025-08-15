// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET semua user
router.get('/', userController.getAllUsers);
// POST user baru
router.post('/', userController.addUser);
// PUT untuk mengedit user berdasarkan ID
router.put('/:id', userController.editUser);
// DELETE user berdasarkan ID
router.delete('/:id', userController.deleteUser);

module.exports = router;