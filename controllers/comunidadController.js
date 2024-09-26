const pool = require('../config/db'); // Conexión a la base de datos

// Función para registrar una comunidad
const registerComunidad = async (req, res) => {
    const { nombre, departamento, provincia, municipio } = req.body;
    const id_usuario = req.user.id_usuario; // id_usuario extraído del token

    // Verificar si el archivo PDF fue subido
    if (!req.file) {
        return res.status(400).json({ error: 'Es necesario subir un archivo PDF.' });
    }

    const pdfUrl = `/uploads/${req.file.filename}`; // Ruta del archivo PDF en el servidor

    try {
        // Iniciar una transacción
        await pool.beginTransaction();

        // Insertar la comunidad en la tabla "comunidad"
        const [comunidadResult] = await pool.query(
            'INSERT INTO comunidad (nombre, departamento, provincia, municipio, pdf_url) VALUES (?, ?, ?, ?, ?)',
            [nombre, departamento, provincia, municipio, pdfUrl]
        );

        
        const id_comunidad = comunidadResult.insertId; // Obtener el ID de la comunidad recién insertada

        // Relacionar el usuario con la comunidad en la tabla "usuario_comunidad"
        await pool.query(
            'INSERT INTO usuario_comunidad (id_usuario, id_comunidad, estado) VALUES (?, ?, ?)',
            [id_usuario, id_comunidad, 'activo']
        );

        // Confirmar la transacción
        await pool.commit();

        res.status(201).json({ message: 'Comunidad registrada exitosamente.' });
    } catch (error) {
        // En caso de error, hacer rollback de la transacción
        await pool.rollback();
        console.error('Error al registrar la comunidad:', error);
        res.status(500).json({ error: 'Ocurrió un error al registrar la comunidad.' });
    }
};

// Función para listar todas las comunidades
const getAllComunidades = async (req, res) => {
    try {
        const [comunidades] = await db.query('SELECT * FROM comunidad');
        res.status(200).json(comunidades);
    } catch (error) {
        console.error('Error al obtener las comunidades:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las comunidades.' });
    }
};

module.exports = {
    registerComunidad,
    getAllComunidades
};
