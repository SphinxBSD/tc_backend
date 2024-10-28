const express = require('express');
const { registerUser, 
    getUserProfile, 
    updateUserProfile, 
    getUsuarios, 
    deleteUsuario,
    getUsuariosDelivery,
    createDelivery,
    getDeliverys,
    asignarDelivery,
    cambiarEstadoPedido,
    obtenerPedidosPorUsuario,
    obtenerAllPedidos,
    obtenerPedidosPorDelivery

 } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const multer = require('multer');
const path = require('path');


// Configuración de Multer para guardar PDFs
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/contratos'); // Carpeta donde se almacenarán los archivos
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf/;
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos PDF.'));
        }
    }
});


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
router.post('/create-delivery', authenticateToken, upload.single('contract'), createDelivery);

// Ruta para obtener todos los deliveries
router.get('/deliveries', authenticateToken, getDeliverys);

router.put('/asignar-delivery', authenticateToken, asignarDelivery);

router.put('/cambiar-estado-pedido', authenticateToken, cambiarEstadoPedido);

router.get('/pedidos', authenticateToken, obtenerPedidosPorUsuario);

router.get('/pedidos/delivery', authenticateToken, obtenerPedidosPorDelivery);

router.get('/all-pedidos', authenticateToken, obtenerAllPedidos);

module.exports = router;
