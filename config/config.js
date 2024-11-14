require('dotenv').config(); // Para cargar las variables de entorno desde un archivo .env

// Base de datos
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'tu_contraseña_de_base_de_datos';
const DB_NAME = process.env.DB_NAME || 'tc_database';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;

// Credenciales para envío de correos
const EMAIL_USER = process.env.EMAIL_USER || 'tu_correo@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'tu_contraseña_de_correo';

// Puerto de la aplicación
const PORT = parseInt(process.env.PORT, 10) || 8080;

// reCaptcha Keys
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || 'tu_recaptcha_secret_key';
const RECAPTCHA_PUBLIC_KEY = process.env.RECAPTCHA_PUBLIC_KEY || 'tu_recaptcha_public_key';

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_para_firmar_jwt';

module.exports = {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  PORT,
  RECAPTCHA_SECRET_KEY,
  RECAPTCHA_PUBLIC_KEY,
  JWT_SECRET,
};
