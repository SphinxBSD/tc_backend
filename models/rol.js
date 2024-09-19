const pool = require('../config/db');

const getRoles = async () => {
  const [rows] = await pool.query('SELECT * FROM rol');
  return rows;
};

const assignRoleToUser = async (id_rol, id_usuario) => {
  await pool.query('INSERT INTO usuario_rol (id_rol, id_usuario) VALUES (?, ?)', [id_rol, id_usuario]);
};

module.exports = { getRoles, assignRoleToUser };
