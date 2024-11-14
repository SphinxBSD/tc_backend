const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_NAME,
  port: config.DB_PORT,
});

// Probar la conexión a la base de datos
const testDBConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Conexión exitosa a la base de datos');
  } catch (error) {
    console.error('Error al conectarse a la base de datos:', error.message);
  }
};

// Llamar a la función para probar la conexión
testDBConnection();

// Exportar funciones para consultas y transacciones
module.exports = {
  query: (sql, params) => pool.execute(sql, params),
  beginTransaction: () => pool.query('START TRANSACTION'),
  commit: () => pool.query('COMMIT'),
  rollback: () => pool.query('ROLLBACK'),
  
};
