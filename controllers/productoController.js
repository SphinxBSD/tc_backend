const pool = require('../config/db'); // Conexión a la base de datos
const { validateCompradorRol } = require('../services/reviewsService')

const registerProduct = async (req, res, next) => {
    const {
      id_categoria,
      nombre_producto,
      descripcion,
      precio,
      id_elaboracion,
      cantidad,
      id_comunidad
    } = req.body;
  
    const idUsuario = req.user.id_usuario;
    // Validar que al menos 4 fotos hayan sido subidas
    if (!req.files || req.files.length < 4) {
      return res.status(400).json({ msg: 'Se requieren al menos 4 fotos' });
    }
  
    try {
      // Iniciar una transacción
    //   const connection = await pool.getConnection();
    //   try {
        // await connection.beginTransaction();
  
        // Crear el inventario
        const [inventarioResult] = await pool.query(
          'INSERT INTO inventario (cantidad, id_comunidad) VALUES (?, ?)',
          [cantidad, id_comunidad]
        );
        const id_inventario = inventarioResult.insertId;

        
  
        // Crear el producto
        // Procesar las rutas de las fotos
        const fotosProcesadas = req.files.map(file => file.path.replace(/\\/g, '/')); // Reemplazar \ por /
        const fotosJSON = JSON.stringify(fotosProcesadas);
        // console.log('========================')
        // console.log(fotosJSON);
        // console.log(fotosProcesadas);


        const [productoResult] = await pool.query(
          `INSERT INTO producto 
            (id_categoria, nombre_producto, descripcion, precio, fotos, id_elaboracion, id_usuario, id_inventario) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id_categoria,
            nombre_producto,
            descripcion,
            precio,
            fotosJSON,
            id_elaboracion,
            idUsuario,
            id_inventario
          ]
        );
  
        // await connection.commit();
  
        res.json({ 
          id_producto: productoResult.insertId,
          id_categoria,
          nombre_producto,
          descripcion,
          precio,
          fotos: fotosProcesadas,
          id_elaboracion,
          id_usuario: idUsuario,
          id_inventario
        });
  
    } catch (err) {
      next(err);
    }
  }

const getCategorias = async (req, res) => {
    try {
        const [categorias] = await pool.query('SELECT * FROM categoria');
        res.json(categorias);
    } catch (error) {
        console.error('Error al obtener las categorías:', error);
        res.status(500).json({ error: 'Ocurrió un error al obtener las categorías.' });
    }
};

const getElaboraciones = async (req, res) => {
    try {
    const [elaboraciones] = await pool.query('SELECT * FROM elaboracion');
    res.json(elaboraciones);
    } catch (error) {
    console.error('Error al obtener las elaboraciones:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener las elaboraciones.' });
    }
};


// Obtener lista de productos con filtros opcionales
const getProductos = async (req, res) => {
    const { id_categoria, id_elaboracion } = req.query;
  
    try {
      let query = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          p.descripcion,
          p.precio,
          i.cantidad,
          p.fotos,
          c.nombre AS categoria,
          e.tipo AS elaboracion
        FROM producto p
        JOIN categoria c ON p.id_categoria = c.id_categoria
        JOIN elaboracion e ON p.id_elaboracion = e.id_elaboracion
        JOIN inventario i ON i.id_inventario = p.id_inventario
        WHERE 1=1
      `;
      let params = [];
  
      if (id_categoria) {
        query += ' AND p.id_categoria = ?';
        params.push(id_categoria);
      }
  
      if (id_elaboracion) {
        query += ' AND p.id_elaboracion = ?';
        params.push(id_elaboracion);
      }
  
      const [rows] = await pool.query(query, params);
  
          // Parsear las fotos de JSON a array de strings
        const productos = rows.map(producto => {
        let fotosArray;
        try {
            for (let i = 0; i < producto.fotos.length; i++) {
                // producto.fotos[i] = 'http://localhost:8080/'+producto.fotos[i];
                producto.fotos[i] = 'https://tcbackend-production-d459.up.railway.app/'+producto.fotos[i];
            }
          fotosArray = producto.fotos;
        } catch (e) {
          console.error(`Error al parsear fotos para el producto ID ${producto.id_producto}:`, e);
          fotosArray = [];
        }
        return {
          ...producto,
          fotos: fotosArray
        };
      });
      res.json(productos);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  };
  

  // Listar productos por artesano
const getProductosByUser = async (req, res) => {
    // const { id_categoria, id_elaboracion } = req.query;
    const id_usuario = req.user.id_usuario; // Extraído del token JWT
    
    try {
      let query = `
        SELECT 
          p.id_producto,
          p.nombre_producto,
          p.descripcion,
          p.precio,
          i.cantidad,
          p.fotos,
          c.nombre AS categoria,
          e.tipo AS elaboracion
        FROM producto p
        JOIN categoria c ON p.id_categoria = c.id_categoria
        JOIN elaboracion e ON p.id_elaboracion = e.id_elaboracion
        JOIN inventario i ON i.id_inventario = p.id_inventario
        WHERE p.id_usuario = ?
      `;
      let params = [id_usuario];


      const [rows] = await pool.query(query, params);

          // Parsear las fotos de JSON a array de strings
        const productos = rows.map(producto => {
        let fotosArray;
        try {
            for (let i = 0; i < producto.fotos.length; i++) {
                // producto.fotos[i] = 'http://localhost:8080/'+producto.fotos[i];
                producto.fotos[i] = 'https://tcbackend-production-d459.up.railway.app/' + producto.fotos[i];

            }
          fotosArray = producto.fotos;
        } catch (e) {
          console.error(`Error al parsear fotos para el producto ID ${producto.id_producto}:`, e);
          fotosArray = [];
        }
        return {
          ...producto,
          fotos: fotosArray
        };
      });

      res.json(productos);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  };

  // Editar un producto
const editarProducto = async (req, res) => {
  const { id_producto } = req.params;
  const {
    id_categoria,
    nombre_producto,
    descripcion,
    precio,
    id_elaboracion,
    cantidad
  } = req.body;
  const idUsuario = req.user.id_usuario;

  try {
    // Verificar si el producto existe
    const [productoRows] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id_producto]);
    if (productoRows.length === 0) {
      return res.status(404).json({ msg: 'Producto no encontrado' });
    }

    const producto = productoRows[0];

    // Verificar si el usuario es el propietario del producto
    if (producto.id_artesano !== idUsuario) {
      return res.status(403).json({ msg: 'No tienes permiso para editar este producto' });
    }

    // Preparar los campos a actualizar
    const campos = [];
    const valores = [];

    if (id_categoria) {
      campos.push('id_categoria = ?');
      valores.push(id_categoria);
    }
    if (nombre_producto) {
      campos.push('nombre_producto = ?');
      valores.push(nombre_producto);
    }
    if (descripcion) {
      campos.push('descripcion = ?');
      valores.push(descripcion);
    }
    if (precio) {
      campos.push('precio = ?');
      valores.push(precio);
    }
    if (id_elaboracion) {
      campos.push('id_elaboracion = ?');
      valores.push(id_elaboracion);
    }

    // Manejar la actualización de fotos si se suben nuevas imágenes
    // if (req.files && req.files.length > 0) {
    //   const fotosProcesadas = req.files.map(file => file.path.replace(/\\/g, '/')); // Reemplazar \ por /
    //   const fotosJSON = JSON.stringify(fotosProcesadas);
    //   campos.push('fotos = ?');
    //   valores.push(fotosJSON);
    // }

    if (campos.length === 0) {
      return res.status(400).json({ msg: 'No hay campos para actualizar' });
    }

    valores.push(id_producto); // Para la cláusula WHERE

    const query = `UPDATE producto SET ${campos.join(', ')} WHERE id_producto = ?`;

    await pool.query(query, valores);

    res.json({ msg: 'Producto actualizado exitosamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

const addReview = async (req, res) => {
  const id_usuario = req.user.id_usuario;
  const { id_producto, rating, description } = req.body;


  try {
      // Verificación de rol de usuario comprador
      const isBuyer = await validateCompradorRol(id_usuario);
      if (!isBuyer) return res.status(403).json({ message: 'Unauthorized' });

      const result = await pool.query(
          'INSERT INTO reviews (id_producto, id_usuario, rating, description) VALUES (?, ?, ?, ?)',
          [id_producto, id_usuario, rating, description]
      );
      res.status(201).json({ message: 'Review added successfully', reviewId: result.insertId });
  } catch (error) {
      res.status(500).json({ message: 'Error adding review', error });
  }
};


const getProductReviews = async (req, res) => {
  const { id_producto } = req.params;
  // console.log(id_producto);
  try {
      const reviews = await pool.query(`
          SELECT u.id_usuario, r.rating, r.description, r.review_date 
          FROM reviews r 
          JOIN usuario u ON r.id_usuario = u.id_usuario 
          WHERE r.id_producto = ?`, [id_producto]
      );

      const avgRating = await pool.query(`
          SELECT AVG(rating) AS avgRating 
          FROM reviews 
          WHERE id_producto = ?`, [id_producto]
      );

      res.json({ reviews, avgRating: avgRating[0] || null });
  } catch (error) {
      res.status(500).json({ message: 'Error fetching reviews', error });
  }
};


  module.exports = {
    registerProduct,
    getCategorias,
    getElaboraciones,
    getProductos,
    getProductosByUser,
    editarProducto,
    addReview,
    getProductReviews
};