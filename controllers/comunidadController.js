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
        const [comunidades] = await pool.query(
            `SELECT c.id_comunidad, c.nombre, c.departamento, c.provincia, c.municipio, c.pdf_url, u.id_usuario
                FROM comunidad c
                INNER JOIN  usuario_comunidad uc ON uc.id_comunidad = c.id_comunidad
                INNER JOIN usuario u ON u.id_usuario = uc.id_usuario
                WHERE uc.estado = 'encargado'`
        );
        res.status(200).json(comunidades);
    } catch (error) {
        console.error('Error al obtener las comunidades:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las comunidades.' });
    }
};

// Función para obtener las comunidades relacionadas con un usuario
const getComunidadesByUsuario = async (req, res) => {
    const idUsuario = req.user.id_usuario;  // Obtenemos el id_usuario desde el token

    try {
        // Consulta para obtener las comunidades asociadas al usuario
        const [comunidades] = await pool.query(
            `SELECT c.*
             FROM comunidad c
             JOIN usuario_comunidad uc ON c.id_comunidad = uc.id_comunidad
             WHERE uc.id_usuario = ? AND uc.estado = 'encargado'`, 
             [idUsuario]
        );

        // Verificar si el usuario está relacionado con alguna comunidad
        if (comunidades.length === 0) {
            return res.status(404).json({ message: 'No se encontraron comunidades para este usuario.' });
        }

        res.status(200).json(comunidades);
    } catch (error) {
        console.error('Error al obtener las comunidades para el usuario:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las comunidades.' });
    }
};


const solicitarIngreso = async (req, res) => {
    const { id_comunidad, id_encargado, mensaje } = req.body;
    const idUsuario = req.user.id_usuario; // Obtenemos el id_usuario desde el token
    // console.log(req.body);
    // console.log(idUsuario);


    if (!id_comunidad || !id_encargado || !mensaje) {
        return res.status(400).json({ error: 'id_comunidad y mensaje son requeridos.' });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO solicitud_art_com (id_comunidad, id_encargado, id_solicitante, mensaje, estado) VALUES (?, ?, ?, ?, 'encurso')`,
            [id_comunidad, id_encargado, idUsuario, mensaje]
        );
        res.status(201).json({ message: 'Solicitud enviada exitosamente.', mensaje: mensaje });
    } catch (error) {
        console.error('Error al enviar la solicitud:', error);
        res.status(500).json({ error: 'Ocurrió un error al enviar la solicitud.' });
    }
}

// Función para listar todas las solicitudes
const getAllSolicitudesByUser = async (req, res) => {

    const idUsuario = req.user.id_usuario;  // Obtenemos el id_usuario desde el token
    try {
        const [solicitudes] = await pool.query(
            `SELECT 
                sac.id_comunidad,
                sac.id_encargado,
                sac.id_solicitante,
                sac.mensaje,
                u.username,
                u.email,
                CONCAT(p.nombre, ' ', p.paterno, ' ', p.materno) as fullname,
                c.nombre, c.departamento, c.provincia, c.municipio
            FROM solicitud_art_com sac
            INNER JOIN usuario u ON u.id_usuario = sac.id_solicitante
            INNER JOIN persona p ON p.id_persona = u.id_persona
            INNER JOIN comunidad c ON c.id_comunidad = sac.id_comunidad
            WHERE sac.estado = 'encurso'
            AND sac.id_encargado = ?`, [idUsuario]
        );
        res.status(200).json(solicitudes);
    } catch (error) {
        console.error('Error al obtener las solicitudes:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las solicitudes.' });
    }
};


const approveRequest = async (req, res) => {
    
    try {
        const idUsuario = req.user.id_usuario;
        const { id_comunidad, id_solicitante } = req.body;

        // Validar que todos los campos necesarios estén presentes
        if (!id_comunidad || !id_solicitante) {
            return res.status(400).json({ message: 'Faltan datos requeridos.' });
        }


        // Verificar que la solicitud existe y está en estado 'encurso'
        const [solicitudRows] = await pool.query(
            `SELECT * FROM solicitud_art_com
             WHERE id_comunidad = ?
               AND id_solicitante = ?
               AND id_encargado = ?
               AND estado = 'encurso'
             FOR UPDATE`,
            [id_comunidad, id_solicitante, idUsuario]
        );

        if (solicitudRows.length === 0) {
            await pool.rollback();
            return res.status(404).json({ message: 'Solicitud no encontrada o ya procesada.' });
        }

        // Actualizar el estado de la solicitud a 'aprobado'
        await pool.query(
            `UPDATE solicitud_art_com
             SET estado = 'aprobado'
             WHERE id_comunidad = ?
               AND id_solicitante = ?
               AND id_encargado = ?`,
            [id_comunidad, id_solicitante, idUsuario]
        );

        // Agregar al usuario en la tabla usuario_comunidad con estado 'artesano'
        await pool.query(
            `INSERT INTO usuario_comunidad (id_usuario, id_comunidad, estado)
             VALUES (?, ?, 'artesano')
             ON DUPLICATE KEY UPDATE estado = 'artesano'`,
            [id_solicitante, id_comunidad]
        );

        // Confirmar la transacción
        // await connection.commit();

        return res.status(200).json({ message: 'Solicitud aprobada y usuario agregado a la comunidad como artesano.' });

    } catch (error) {
        // En caso de error, revertir la transacción
        if (pool) await pool.rollback();
        console.error('Error al aprobar la solicitud:', error);
        return res.status(500).json({ message: 'Error interno del servidor.' });
    } 
};


module.exports = {
    registerComunidad,
    getAllComunidades,
    getComunidadesByUsuario,
    solicitarIngreso,
    getAllSolicitudesByUser,
    approveRequest
};
