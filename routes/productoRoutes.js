const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const pool = require('../config/db');
const { registerProduct,
    getCategorias,
    getElaboraciones,
    getProductos,
    getProductosByUser
 } = require('../controllers/productoController');

// Configuración de Multer para subir fotos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/fotos/');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });

const upload = multer({
    storage: storage,
    limits: { files: 10 }, // Limita a máximo 10 fotos
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        
        if (mimetype && extname) {
        return cb(null, true);
        } else {
        cb(new Error('Error: Solo se permiten imágenes'));
        }
    }
});

// Ruta para registrar un nuevo producto
router.post('/registrar', authenticateToken, upload.array('fotos', 10), registerProduct);

// Ruta para obtener las categorias
router.get('/categorias', getCategorias);

// Ruta para obtener las elaboraciones
router.get('/elaboraciones', getElaboraciones);

// Obtener productos
router.get('/mostrar', getProductos);

// Obtener productos
router.get('/mostrarByUser', authenticateToken, getProductosByUser);

module.exports = router;