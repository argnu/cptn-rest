const { Pool } = require('pg')
const config = require('../../config');
const pool = new Pool(config.db);

function addSubsidiario(client, subsidiario) {
  let query = `
    INSERT INTO subsidiario (
      dni, nombre, apellido,
      porcentaje, profesional)
    VALUES($1, $2, $3, $4, $5)
  `;
  let values = [
    subsidiario.dni, subsidiario.nombre,
    subsidiario.apellido, subsidiario.porcentaje,
    subsidiario.profesional
  ];

  return client.query(query, values);
}

module.exports.addSubsidiario = addSubsidiario;

module.exports.add = function(subsidiario) {
  return addSubsidiario(pool, subsidiario)
}

module.exports.getAll = function(id) {
  let query = `SELECT dni, nombre, apellido, porcentaje
               FROM subsidiario
               WHERE profesional=$1`;
  let values = [ id ];
  return pool.query(query, values);
}
