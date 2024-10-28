const db = require('../config/db');

exports.validateCompradorRol = async (id_user) => {
    const [userRole] = await db.query(
        'SELECT * FROM usuario_rol WHERE id_usuario = ? AND id_rol = 2',
        [id_user]
    );
    return !!userRole;
};
