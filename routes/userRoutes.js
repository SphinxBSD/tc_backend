const express = require('express');
const { registerUser, 
    getUserProfile, 
    updateUserProfile, 
    getUsuarios, 
    deleteUsuario,
    getUsuariosDelivery,
    createDelivery,
    getDeliverys
 } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/registrar', registerUser);

// Ruta para obtener el perfil del usuario (protegida)
router.get('/profile', authenticateToken, getUserProfile);

// Ruta para actualizar el perfil del usuario (protegida)
router.put('/setprofile', authenticateToken, updateUserProfile);

// Ruta para listar usuarios
router.get('/usuarios', authenticateToken, getUsuarios);

// Ruta para eliminar un usuario
router.delete('/usuarios/:id_usuario', authenticateToken, deleteUsuario);

// Ruta para listar usuarios delivery
router.get('/usuarios/delivery', authenticateToken, getUsuariosDelivery);

// Ruta para crear un nuevo 'delivery'
router.post('/usuarios/:id_usuario/delivery', authenticateToken, createDelivery);

// Ruta para obtener todos los deliveries
router.get('/deliveries', authenticateToken, getDeliverys);

module.exports = router;
