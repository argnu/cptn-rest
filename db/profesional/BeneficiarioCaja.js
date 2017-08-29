const { Pool } = require('pg')
const config = require('../../config');
const pool = new Pool(config.db);

function addBeneficiario(client, nuevo_beneficiario) {
  let query = `
    INSERT INTO beneficiarioCaja (
      dni, nombre, apellido, fechaNacimiento,
      vinculo, invalidez, profesional)
    VALUES($1, $2, $3, $4, $5, $6, $7)
  `;
  let values = [
    nuevo_beneficiario.dni, nuevo_beneficiario.nombre,
    nuevo_beneficiario.apellido, nuevo_beneficiario.fechaNacimiento,
    nuevo_beneficiario.vinculo, nuevo_beneficiario.invalidez, nuevo_beneficiario.profesional
  ];

  return client.query(query, values);
}

module.exports.addBeneficiario = addBeneficiario;

module.exports.add = function(nuevo_beneficiario) {
  return addBeneficiario(pool, nuevo_beneficiario)
}

module.exports.getAll = function(id) {
  let query = `SELECT dni, nombre, apellido, fechaNacimiento, vinculo, invalidez
               FROM beneficiariocaja
               WHERE profesional=$1`;
  let values = [ id ];
  return pool.query(query, values);
}
