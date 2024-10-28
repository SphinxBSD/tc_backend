const { createPersona } = require('../models/persona');
const { createUsuario, findUsuarioByUsername } = require('../models/usuario');
const { getRoles, assignRoleToUser } = require('../models/rol');
const { hashPassword } = require('../utils/hashPassword');
const { sendRegistrationEmail } = require('../services/emailService');
const pool = require('../config/db'); 

const registerUser = async (req, res) => {
  try {
    const { ci, nombre, paterno, materno, fecha_nac, direccion, telefono, username, email, password, id_rol } = req.body;

    // Validar si el username ya existe
    const existingUser = await findUsuarioByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: 'El username ya está en uso' });
    }

    // Crear la persona
    const id_persona = await createPersona({ ci, nombre, paterno, materno, fecha_nac, direccion, telefono });

    // Encriptar la contraseña
    const hashedPassword = await hashPassword(password);

    // Crear el usuario
    const id_usuario = await createUsuario({ username, email, password: hashedPassword, id_persona });

    // Asignar el rol al usuario
    await assignRoleToUser(id_rol, id_usuario);

    // Obtener el nombre del rol
    const roles = await getRoles();
    const role = roles.find(r => r.id_rol === parseInt(id_rol));

    // Enviar correo de confirmación
    await sendRegistrationEmail(email, username, role.nombre_rol);

    res.status(201).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
};

// Obtener el perfil del usuario
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id_usuario;  // Suponiendo que el middleware de autenticación ya ha validado el token

    const userQuery = `
      SELECT u.id_usuario, u.username, u.email, p.nombre, p.paterno, p.materno, p.fecha_nac, p.direccion, p.telefono,
             GROUP_CONCAT(r.nombre_rol) AS roles
      FROM usuario u
      JOIN persona p ON u.id_persona = p.id_persona
      LEFT JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario
      LEFT JOIN rol r ON ur.id_rol = r.id_rol
      WHERE u.id_usuario = ?
      GROUP BY u.id_usuario;
    `;
    
    const [userRows] = await pool.query(userQuery, [userId]);

    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(userRows[0]);
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Editar el perfil del usuario
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id_usuario;
    const { nombre, paterno, materno, fecha_nac, direccion, telefono } = req.body;

    const updateQuery = `
      UPDATE persona
      SET nombre = ?, paterno = ?, materno = ?, fecha_nac = ?, direccion = ?, telefono = ?
      WHERE id_persona = (SELECT id_persona FROM usuario WHERE id_usuario = ?)
    `;

    await pool.query(updateQuery, [nombre, paterno, materno, fecha_nac, direccion, telefono, userId]);

    res.json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Obtener lista de todos los usuarios
const getUsuarios = async (req, res) => {
  try {
      const usuariosQuery = `
          SELECT u.id_usuario, u.username, u.email, p.nombre, p.paterno, p.materno
          FROM usuario u
          LEFT JOIN persona p ON u.id_persona = p.id_persona
          WHERE u.estado = 'activo';`;

      const [usuarios] = await pool.query(usuariosQuery);
      res.json(usuarios);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener los usuarios" });
  }
};

// Obtener lista de todos los usuarios deliverys
const getUsuariosDelivery = async (req, res) => {
  try {
      const usuariosQuery = `
          SELECT u.id_usuario, u.username, u.email, p.nombre, p.paterno, p.materno
          FROM usuario u
          LEFT JOIN persona p ON u.id_persona = p.id_persona
          INNER JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
          WHERE u.estado = 'activo'
          AND ur.id_rol = 5
          AND u.id_usuario NOT IN 
          (
            SELECT id_usuario
              FROM delivery
          )`;

      const [usuarios] = await pool.query(usuariosQuery);
      res.json(usuarios);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al obtener los deliverys" });
  }
};

// Eliminar un usuario por su id
const deleteUsuario = async (req, res) => {
  const { id_usuario } = req.params;

  try {
    const updateQuery = 'UPDATE usuario SET estado = ? WHERE id_usuario = ?';
    await pool.query(updateQuery, ['eliminado', id_usuario]);
    res.json({ message: "Usuario marcado como eliminado" });
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Error al eliminar el usuario" });
  }
};

// Crear un nuevo 'delivery'
const createDelivery = async (req, res) => {
  const { id_usuario } = req.body;

  try {
      if (!req.file) {
          return res.status(400).json({ message: 'Debe subir un archivo PDF.' });
      }

      const contractPath = `/uploads/contratos/${req.file.filename}`;

      // Insertar el registro en la tabla delivery
      await pool.query(
          'INSERT INTO delivery (id_usuario, contrato, estado, fecha_inicio) VALUES (?, ?, ?, ?)',
          [id_usuario, contractPath, 'disponible', new Date()]
      );

      res.status(201).json({ message: 'Delivery creado exitosamente con contrato adjunto', contrato: contractPath });
  } catch (error) {
      res.status(500).json({ message: 'Error al crear el delivery', error });
  }
};

const getDeliverys = async (req, res) => {
  try {
      // Obtener todos los usuarios con rol de delivery
      const deliveries = await pool.query(`
          SELECT u.id_usuario, d.id_delivery, u.username, d.contrato, d.estado, d.fecha_inicio 
          FROM usuario u 
          INNER JOIN usuario_rol ur ON u.id_usuario = ur.id_usuario 
          INNER JOIN delivery d ON u.id_usuario = d.id_usuario 
          WHERE ur.id_rol = 5
      `);
      if (deliveries[0].length === 0 || deliveries[0] === undefined) {
        return res.status(404).json({ message: 'No hay deliveries' });
      }
      res.status(200).json(deliveries[0]);
  } catch (error) {
      res.status(500).json({ message: 'Error al obtener deliveries', error });
  }
};

// Asignar delivery a un pedido
// const asignarDelivery = async (req, res) => {
//   const { id_pedido, id_delivery } = req.body;

//   try {
//     const [result] = await pool.query(
//       'UPDATE pedidos SET id_delivery = ?, estado = "asignado" WHERE id_pedido = ?', 
//       [id_delivery, id_pedido]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: 'Pedido no encontrado' });
//     }

//     res.json({ message: 'Delivery asignado exitosamente' });
//   } catch (error) {
//     console.error('Error al asignar delivery:', error);
//     res.status(500).json({ message: 'Error al asignar delivery' });
//   }
// };


// Asignar delivery a pedido y actualizar estado del delivery si tiene 10 pedidos
const asignarDelivery = async (req, res) => {
  const { id_pedido, id_delivery } = req.body;

  try {
    // Asignar el delivery al pedido
    await pool.query('UPDATE pedidos SET id_delivery = ?, estado = "asignado" WHERE id_pedido = ?', [id_delivery, id_pedido]);

    // Contar los pedidos asignados al delivery
    const [pedidosAsignados] = await pool.query(
      'SELECT COUNT(*) AS total FROM pedidos WHERE id_delivery = ? AND estado IN ("asignado", "encurso")',
      [id_delivery]
    );

    const totalPedidos = pedidosAsignados[0].total;

    // Actualizar el estado del delivery a "ocupado" si tiene 10 pedidos
    if (totalPedidos >= 10) {
      await pool.query('UPDATE delivery SET estado = "ocupado" WHERE id_usuario = ?', [id_delivery]);
    }

    res.json({ message: 'Delivery asignado exitosamente' });
  } catch (error) {
    console.error('Error al asignar delivery:', error);
    res.status(500).json({ message: 'Error al asignar delivery' });
  }
};

// Cambiar estado de pedido
const cambiarEstadoPedido = async (req, res) => {
  const { id_pedido, estado } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE pedidos SET estado = ? WHERE id_pedido = ?', 
      [estado, id_pedido]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    res.json({ message: 'Estado de pedido actualizado' });
  } catch (error) {
    console.error('Error al actualizar el estado del pedido:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del pedido' });
  }
};

  // Obtener pedidos por usuario
  const obtenerPedidosPorUsuario = async (req, res) => {
    const id_usuario = req.user.id_usuario;

    try {
      const [pedidos] = await pool.query(
        `
        SELECT p.id_pedido, p.estado, p.fecha_pedido, prod.nombre_producto, dp.precio_unitario, dp.cantidad
        FROM pedidos p
        INNER JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
        INNER JOIN producto prod ON prod.id_producto = dp.id_producto
        WHERE p.id_usuario = ?
        AND p.estado != 'cancelado'
        AND p.estado != 'entregado'
        `, 
        [id_usuario]
      );
      res.json(pedidos);
    } catch (error) {
      console.error('Error al obtener pedidos del usuario:', error);
      res.status(500).json({ message: 'Error al obtener pedidos' });
    }
  };

    // Obtener pedidos por usuario
    const obtenerPedidosPorDelivery = async (req, res) => {
      const id_usuario = req.user.id_usuario;
      
  
      try {
        const [id_delivery_temp] = await pool.query(
          `
          SELECT id_delivery
          FROM delivery
          WHERE id_usuario = ?
          `, 
          [id_usuario]
        );

        const id_delivery = id_delivery_temp[0].id_delivery;
        console.log(id_delivery);

        const [pedidos] = await pool.query(
          `
          SELECT p.id_pedido, p.estado, p.fecha_pedido, prod.nombre_producto, dp.precio_unitario, dp.cantidad
          FROM pedidos p
          INNER JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
          INNER JOIN producto prod ON prod.id_producto = dp.id_producto
          WHERE p.id_delivery = ?
          AND p.estado != 'cancelado'
          AND p.estado != 'entregado'
          `, 
          [id_delivery]
        );
        res.json(pedidos);
      } catch (error) {
        console.error('Error al obtener pedidos del usuario:', error);
        res.status(500).json({ message: 'Error al obtener pedidos' });
      }
    };


  // Obtener pedidos por usuario
  const obtenerAllPedidos = async (req, res) => {
    // const id_usuario = req.user.id_usuario;

    try {
      const [pedidos] = await pool.query(
        `
        SELECT p.id_pedido, p.estado, p.fecha_pedido, prod.nombre_producto, dp.precio_unitario, dp.cantidad
        FROM pedidos p
        INNER JOIN detalle_pedido dp ON dp.id_pedido = p.id_pedido
        INNER JOIN producto prod ON prod.id_producto = dp.id_producto
        WHERE p.estado != 'cancelado'
        AND p.estado != 'entregado'
        `
      );
      res.json(pedidos);
    } catch (error) {
      console.error('Error al obtener pedidos del usuario:', error);
      res.status(500).json({ message: 'Error al obtener pedidos' });
    }
  };


module.exports = { 
  registerUser,  
  getUserProfile, 
  updateUserProfile, 
  getUsuarios, 
  deleteUsuario,
  getUsuariosDelivery,
  createDelivery,
  getDeliverys,
  asignarDelivery,
  cambiarEstadoPedido,
  obtenerPedidosPorUsuario,
  obtenerAllPedidos,
  obtenerPedidosPorDelivery
};
