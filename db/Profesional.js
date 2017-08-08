

const { Pool } = require('pg')
const config = require('../config');
const pool = new Pool(config.db);

module.exports.add = function(nuevo_profesional) {
  let query = `
    INSERT INTO profesional (
      dni, nombre, apellido, fechaNacimiento, sexo,
      nacionalidad, estadoCivil, observaciones, cuit
    )
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `;
  let values = [
    nuevo_profesional.dni, nuevo_profesional.nombre,
    nuevo_profesional.apellido, nuevo_profesional.fechaNacimiento,
    nuevo_profesional.sexo, nuevo_profesional.nacionalidad,
    nuevo_profesional.estadoCivil, nuevo_profesional.observaciones,
    nuevo_profesional.cuit
  ];

  return pool.query(query, values);
}


module.exports.getAll = function() {
  return pool.query('SELECT * FROM profesional');
}


module.exports.get = function(id) {
  let query = 'SELECT * FROM profesional WHERE id=$1';
  let values = [ id ]
  return pool.query(query, values);
}
