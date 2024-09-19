require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const pool = require('./config/db'); 
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
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
