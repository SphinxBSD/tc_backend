const { createUsuario,
  findUsuarioByUsername,
  findUsuarioByUsernameAndEmail,
  updatePassword } = require('../models/usuario');
const bcrypt = require('bcrypt');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const config = require('./config');

const loginUser = async (req, res) => {
  const { username, password, tokenCaptcha } = req.body;

  try {
    // 1. Verificar reCaptcha v3 con Google
    // const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${config.RECAPTCHA_SECRET_KEY}&response=${tokenCaptcha}`;
    // const captchaResponse = await axios.post(captchaVerificationUrl);

    // if (!captchaResponse.data.success || captchaResponse.data.score < 0.5) {
    //   return res.status(400).json({ message: 'Falló la verificación del captcha' });
    // }

    // 2. Buscar al usuario por username
    const user = await findUsuarioByUsername(username);
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // 3. Comparar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // 4. Generar un JWT si es necesario
    const token = jwt.sign(
      { id_usuario: user.id_usuario, username: user.username },
      config.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 5. Retornar el token o una respuesta de autenticación exitosa
    res.status(200).json({
      message: 'Autenticación exitosa',
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al autenticar al usuario' });
  }
};


const recoverPassword = async (req, res) => {
  const { username, email } = req.body;

  try {
    // 1. Verificar reCaptcha v3 con Google
    // const captchaVerificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${tokenCaptcha}`;
    // const captchaResponse = await axios.post(captchaVerificationUrl);

    // if (!captchaResponse.data.success || captchaResponse.data.score < 0.5) {
    //   return res.status(400).json({ message: 'Falló la verificación del captcha' });
    // }

    // 2. Verificar que el username y email existen en la base de datos
    const user = await findUsuarioByUsernameAndEmail(username, email);
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado o email incorrecto' });
    }

    // 3. Generar una nueva contraseña autogenerada
    const newPassword = crypto.randomBytes(8).toString('hex'); // Genera una contraseña de 8 caracteres aleatorios

    // 4. Encriptar la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Actualizar la contraseña en la base de datos
    await updatePassword(user.id_usuario, hashedPassword);

    // 6. Configurar el servicio de envío de correo electrónico
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: config.EMAIL_USER,  // Tu correo electrónico
        pass: config.EMAIL_PASS  // Contraseña del correo electrónico
      }
    });

    // 7. Enviar el correo con la nueva contraseña
    const mailOptions = {
      from: config.EMAIL_USER,
      to: user.email,
      subject: 'Recuperación de Contraseña',
      text: `Hola ${user.username},\n\nTu nueva contraseña es: ${newPassword}\n\nPor favor, cambia esta contraseña una vez que hayas iniciado sesión.`
    };

    await transporter.sendMail(mailOptions);

    // 8. Responder al cliente
    res.status(200).json({ message: 'Correo enviado con la nueva contraseña' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al recuperar la contraseña' });
  }
};

module.exports = { loginUser, recoverPassword };
