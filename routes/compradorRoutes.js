const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { confirmarCompra, obtenerHistorialCompras } = require('../controllers/compradorController');

// Confirmar compra
router.post('/comprar', authenticateToken, confirmarCompra);
// Ruta para obtener el historial de compras del usuario autenticado
router.get('/historial', authenticateToken, obtenerHistorialCompras);

module.exports = router;