require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const comunidadRoutes = require('./routes/comunidadRoutes');
const artesanoRoutes = require('./routes/artesanoRoutes');
const productoRoutes = require('./routes/productoRoutes');
const carritoRoutes = require('./routes/carritoRoutes');
const compradorRoutes = require('./routes/compradorRoutes')
const pool = require('./config/db'); 
const cors = require('cors');
const path = require('path');

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Para servir las fotos
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comunidad', comunidadRoutes);
app.use('/api/artesano', artesanoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/comprador', compradorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Middlewares
app.use(express.json()); // Para parsear JSON
app.use('/uploads', express.static('uploads')); // Para servir los archivos PDF subidos


