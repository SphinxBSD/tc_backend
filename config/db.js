const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
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
  rollback: () => pool.query('ROLLBACK')
};
