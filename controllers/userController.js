const { createPersona } = require('../models/persona');
const { createUsuario, findUsuarioByUsername } = require('../models/usuario');
const { getRoles, assignRoleToUser } = require('../models/rol');
const { hashPassword } = require('../utils/hashPassword');
const { sendRegistrationEmail } = require('../services/emailService');

const registerUser = async (req, res) => {
  try {
    const { ci, nombre, paterno, materno, fecha_nac, direccion, username, email, password, id_rol } = req.body;

    // Validar si el username ya existe
    const existingUser = await findUsuarioByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'El username ya está en uso' });
    }

    // Crear la persona
    const id_persona = await createPersona({ ci, nombre, paterno, materno, fecha_nac, direccion });

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

module.exports = { registerUser };
