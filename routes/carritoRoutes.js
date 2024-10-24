const express = require('express');
const router = express.Router();

const { agregarProductoCarrito, listarProductosCarrito, eliminarProductoDelCarrito } = require('../controllers/carritoController');

const { authenticateToken } = require('../middleware/auth');

// Agregar producto al carrito
router.post('/agregar', authenticateToken, agregarProductoCarrito);

// Listar productos del carrito
router.get('/listar', authenticateToken, listarProductosCarrito);

// Ruta para eliminar un producto del carrito
router.delete('/eliminar/:id_producto', authenticateToken, eliminarProductoDelCarrito)

module.exports = router;