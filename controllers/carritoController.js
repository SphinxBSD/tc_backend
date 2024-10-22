const pool = require('../config/db');

// Agregar producto al carrito
const agregarProductoCarrito = async (req, res) => {
    const { id_producto, cantidad } = req.body;
    const id_usuario = req.user.id_usuario; // ID del usuario conectado
  
    try {
        // Verificar si el producto ya está en el carrito
        const [existing] = await pool.query('SELECT * FROM carrito WHERE id_usuario = ? AND id_producto = ?', [id_usuario, id_producto]);
  
        if (existing.length > 0) {
            // Si ya está en el carrito, solo se actualiza la cantidad
            await pool.query('UPDATE carrito SET cantidad = cantidad + ? WHERE id_carrito = ?', [cantidad, existing[0].id_carrito]);
        } else {
            // Si no está en el carrito, se inserta el nuevo producto
            await pool.query('INSERT INTO carrito (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)', [id_usuario, id_producto, cantidad]);
        }
  
        res.json({ message: 'Producto agregado al carrito' });
    } catch (error) {
        console.error('Error al agregar producto al carrito:', error);
        res.status(500).json({ message: 'Error al agregar producto al carrito' });
    }
  };
  
  // Listar productos en el carrito del usuario
  const listarProductosCarrito = async (req, res) => {
    const id_usuario = req.user.id_usuario;
  
    try {
        const [rows] = await pool.query(`
            SELECT c.id_carrito, p.id_producto, p.nombre_producto, p.precio, c.cantidad, p.fotos
            FROM carrito c
            JOIN producto p ON c.id_producto = p.id_producto
            WHERE c.id_usuario = ?`, [id_usuario]);
  
        // Parsear las fotos de JSON a array de strings
        productos = rows.map(producto => {
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
        
        res.json(productos);
    } catch (error) {
        console.error('Error al listar productos del carrito:', error);
        res.status(500).json({ message: 'Error al listar productos del carrito' });
    }
  };
  

module.exports = {
    agregarProductoCarrito,
    listarProductosCarrito,
}