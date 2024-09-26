const pool = require('../config/db');

const createPersona = async (persona) => {
  const [result] = await pool.query(
    'INSERT INTO persona (ci, nombre, paterno, materno, fecha_nac, direccion, telefono) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [persona.ci, persona.nombre, persona.paterno, persona.materno, persona.fecha_nac, persona.direccion, persona.telefono]
  );
  return result.insertId;
};

module.exports = { createPersona };
