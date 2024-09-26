const express = require('express');
const router = express.Router();
const { registerComunidad } = require('../controllers/comunidadController');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configuración de multer para subir PDFs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único para el archivo
    }
});
const upload = multer({ storage });

// Ruta para registrar una comunidad
router.post('/registrar', authenticateToken, upload.single('documento'), registerComunidad);
// router.get('/comunidades', authenticateToken, getAllComunidades);

module.exports = router;
