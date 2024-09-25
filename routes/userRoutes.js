const express = require('express');
const { registerUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/registrar', registerUser);

// Ruta para obtener el perfil del usuario (protegida)
router.get('/profile', authenticateToken, getUserProfile);

// Ruta para actualizar el perfil del usuario (protegida)
router.put('/setprofile', authenticateToken, updateUserProfile);

module.exports = router;
