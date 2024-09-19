const express = require('express');
const { loginUser, recoverPassword } = require('../controllers/authController');

const router = express.Router();

// Ruta para login
router.post('/login', loginUser);
// Ruta para recuperar contraseña
router.post('/recover-password', recoverPassword);

module.exports = router;
