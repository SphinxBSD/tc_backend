const express = require('express');
const router = express.Router();

const { agregarProductoCarrito, listarProductosCarrito } = require('../controllers/carritoController');

const { authenticateToken } = require('../middleware/auth');

// Agregar producto al carrito
router.post('/agregar', authenticateToken, agregarProductoCarrito);

// Listar productos del carrito
router.get('/listar', authenticateToken, listarProductosCarrito);

module.exports = router;