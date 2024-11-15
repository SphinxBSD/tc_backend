const nodemailer = require('nodemailer');

const sendRegistrationEmail = async (email, username, role) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', // O el servicio que prefieras
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: config.EMAIL_USER,
    to: email,
    subject: 'Registro Exitoso',
    text: `Bienvenido ${username}, se te ha asignado el rol: ${role}.`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendRegistrationEmail };
