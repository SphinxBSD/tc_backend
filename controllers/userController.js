const { createPersona } = require('../models/persona');
const { createUsuario, findUsuarioByUsername } = require('../models/usuario');
const { getRoles, assignRoleToUser } = require('../models/rol');
const { hashPassword } = require('../utils/hashPassword');
const { sendRegistrationEmail } = require('../services/emailService');
const pool = require('../config/db'); 

const registerUser = async (req, res) => {
  try {
    const { ci, nombre, paterno, materno, fecha_nac, direccion, telefono, username, email, password, id_rol } = req.body;

    // Validar si el username ya existe
    const existingUser = await findUsuarioByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'El username ya está en uso' });
    }

    // Crear la persona
    const id_persona = await createPersona({ ci, nombre, paterno, materno, fecha_nac, direccion, telefono });

    // Encriptar la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el usuario
    const id_usuario = await createUsuario({ username, email, password: hashedPassword, id_persona });

    // Asignar el rol al usuario
    await assignRoleToUser(id_rol, id_usuario);

    // Obtener el nombre del rol
    const roles = await getRoles();
    const role = roles.find(r => r.id_rol === parseInt(id_rol));

    // Enviar correo de confirmación
    await sendRegistrationEmail(email, username, role.nombre_rol);

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Obtener el perfil del usuario
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id_usuario;  // Suponiendo que el middleware de autenticación ya ha validado el token

    const userQuery = `
      SELECT u.id_usuario, u.username, u.email, p.nombre, p.paterno, p.materno, p.fecha_nac, p.direccion, p.telefono,
             GROUP_CONCAT(r.nombre_rol) AS roles
      FROM usuario u
      JOIN persona p ON u.id_persona = p.id_persona
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN rol r ON ur.id_rol = r.id_rol
      WHERE u.id_usuario = ?
      GROUP BY u.id_usuario;
    `;
    
    const [userRows] = await pool.query(userQuery, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(userRows[0]);
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Editar el perfil del usuario
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { nombre, paterno, materno, fecha_nac, direccion } = req.body;

    const updateQuery = `
      UPDATE persona
      SET nombre = ?, paterno = ?, materno = ?, fecha_nac = ?, direccion = ?, telefono = ?
      WHERE id_persona = (SELECT id_persona FROM usuario WHERE id_usuario = ?)
    `;

    await pool.query(updateQuery, [nombre, paterno, materno, fecha_nac, direccion, userId]);

    res.json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


module.exports = { registerUser,  getUserProfile, updateUserProfile };
