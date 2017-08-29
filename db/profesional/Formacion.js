const { Pool } = require('pg')
const config = require('../../config');
const pool = new Pool(config.db);

function addFormacion(client, formacion) {
  let query = `
    INSERT INTO formacion (titulo, tipo, fecha, institucion, profesional)
    VALUES($1, $2, $3, $4, $5)
  `;
  let values = [
    formacion.titulo, formacion.tipo, formacion.fecha,
    formacion.institucion, formacion.profesional
  ];

  return client.query(query, values)
}

module.exports.addFormacion = addFormacion;

module.exports.add = function(formacion) {
  return addFormacion(pool, formacion);
}

module.exports.getAll = function(id) {
  let query = `SELECT titulo, tipo, fecha, institucion.nombre as institucion
               FROM formacion INNER JOIN institucion ON formacion.institucion=institucion.id
               WHERE profesional=$1`;
  let values = [ id ];
  return pool.query(query, values);
}
