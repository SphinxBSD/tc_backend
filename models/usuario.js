const pool = require('../config/db');

const createUsuario = async (usuario) => {
  const [result] = await pool.query(
    'INSERT INTO usuario (username, email, password, fecha_reg, id_persona) VALUES (?, ?, ?, NOW(), ?)',
    [usuario.username, usuario.email, usuario.password, usuario.id_persona]
  );
  return result.insertId;
};

const findUsuarioByUsername = async (username) => {
  const [rows] = await pool.query('SELECT * FROM usuario WHERE username = ?', [username]);
  return rows[0];
};

// Función para buscar usuario por username y email
const findUsuarioByUsernameAndEmail = async (username, email) => {
  // const connection = await pool.getConnection();
  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuario WHERE username = ? AND email = ?',
      [username, email]
    );
    return rows.length > 0 ? rows[0] : null;
  } finally {
    // connection.release();
    console.log('Conexión liberada');
  }
};

// Función para actualizar la contraseña de un usuario
const updatePassword = async (id_usuario, newPassword) => {
  // const connection = await pool.getConnection();
  try {
    await pool.query(
      'UPDATE usuario SET password = ? WHERE id_usuario = ?',
      [newPassword, id_usuario]
    );
  } finally {
    // connection.release();
    console.log('Conexión liberada');
  }
};

module.exports = { 
      createUsuario,
      findUsuarioByUsername,
      findUsuarioByUsernameAndEmail,
      updatePassword
     };
