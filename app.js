require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const comunidadRoutes = require('./routes/comunidadRoutes');
const artesanoRoutes = require('./routes/artesanoRoutes');
const pool = require('./config/db'); 
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comunidad', comunidadRoutes);
app.use('/api/artesano', artesanoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middlewares
app.use(express.json()); // Para parsear JSON
app.use('/uploads', express.static('uploads')); // Para servir los archivos PDF subidos


