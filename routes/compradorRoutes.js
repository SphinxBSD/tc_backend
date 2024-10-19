const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { confirmarCompra } = require('../controllers/compradorController');

// Confirmar compra
router.post('/comprar', authenticateToken, confirmarCompra);

module.exports = router;