const pool = require('../config/db');

// Confirmar compra (crear pedido)
const confirmarCompra = async (req, res) => {
    const id_usuario = req.user.id_usuario;
  
    try {
        // 1. Obtener los productos del carrito
        const [carrito] = await pool.query(
            `SELECT c.id_carrito, c.id_usuario, c.id_producto, c.cantidad, p.precio
            FROM carrito c
            INNER JOIN producto p ON p.id_producto = c.id_producto
            WHERE c.id_usuario = ?`,
             [id_usuario]);
  
        if (carrito.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }
  
        // 2. Calcular el total
        let total = 0;
        carrito.forEach(item => {
            total += item.cantidad * item.precio;
        });
  
        // 3. Crear el pedido en la tabla 'pedidos'
        const [result] = await pool.query('INSERT INTO pedidos (id_usuario, total) VALUES (?, ?)', [id_usuario, total]);
  
        const id_pedido = result.insertId; // Obtenemos el id del pedido recién insertado
  
        // 4. Insertar los detalles del pedido en la tabla 'detalle_pedido'
        const detalles = carrito.map(item => [id_pedido, item.id_producto, item.cantidad, item.precio]);
  
        

        for (let i = 0; i < detalles.length; i++) {
            // Verificar el formato de los detalles
            // Aquí usamos 'bulk insert' con un array de arrays
         // '?' se usa para pasar un array de arrays
            const insertQuery = `INSERT INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`;
            await pool.query(insertQuery, [detalles[i][0], detalles[i][1], detalles[i][2], detalles[i][3]]); // Se pasa el array de arrays correctamente
        }
  
        // 5. Vaciar el carrito después de la compra exitosa
        await pool.query('DELETE FROM carrito WHERE id_usuario = ?', [id_usuario]);
  
        res.json({ message: 'Compra realizada exitosamente' });
    } catch (error) {
        console.error('Error al confirmar compra:', error);
        res.status(500).json({ message: 'Error al confirmar compra', error });
    }
};


module.exports = {
    confirmarCompra
    
}