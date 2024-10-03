const express = require('express');
const router = express.Router();

const {
    artesanosComunidad
} = require('../controllers/artesanoController');
const { authenticateToken } = require('../middleware/auth');

router.get('/comunarios', authenticateToken, artesanosComunidad);

module.exports = router;