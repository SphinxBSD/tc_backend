const pool = require('../config/db'); // Conexión a la base de datos

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
        console.log('========================')
        console.log(fotosJSON);
        console.log(fotosProcesadas);
        // console.log( "id_categoria: ", id_categoria);
        // console.log( "nombre_producto: ", nombre_producto);
        // console.log( "descripcion: ", descripcion);
        // console.log( "precio: ", precio);
        // console.log( "fotos: ", JSON.stringify(fotosPaths));
        // console.log( "id_elaboracion: ", id_elaboracion);
        // console.log( "idUsuario: ", idUsuario);


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
  
    //   } catch (err) {
    //     await connection.rollback();
    //     throw err;
    //   } finally {
    //     connection.release();
    //   }
  
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
          p.fotos,
          c.nombre AS categoria,
          e.tipo AS elaboracion
        FROM producto p
        JOIN categoria c ON p.id_categoria = c.id_categoria
        JOIN elaboracion e ON p.id_elaboracion = e.id_elaboracion
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
                producto.fotos[i] = 'http://localhost:8080/'+producto.fotos[i];
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
      // Parsear las fotos de JSON a array de strings
    //   const productos = rows.map(producto => ({
    //     ...producto,
    //     fotos: JSON.parse(producto.fotos)
    //   }));
  
      res.json(productos);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error en el servidor');
    }
  };
  

  module.exports = {
    registerProduct,
    getCategorias,
    getElaboraciones,
    getProductos
};