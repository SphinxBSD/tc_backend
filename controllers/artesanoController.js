const pool = require('../config/db'); // Conexión a la base de datos

const artesanosComunidad = async (req, res) => {
    try {
        const [artesanos] = await pool.query(
            `SELECT u.id_usuario, u.username, u.email, CONCAT(p.nombre, ' ', p.paterno, ' ', p.materno) as fullname
            FROM persona p
            INNER JOIN usuario u ON u.id_persona = p.id_persona
            INNER JOIN usuario_comunidad uc ON uc.id_usuario = u.id_usuario
            WHERE uc.estado = 'artesano'`
        );
        res.status(200).json(artesanos);
    } catch (error) {
        console.error('Error al obtener las comunidades:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las comunidades.' });
    }
};

module.exports = { artesanosComunidad };