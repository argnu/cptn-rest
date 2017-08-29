const { Pool } = require('pg')
const config = require('../../config');
const pool = new Pool(config.db);

function addContacto(client, contacto) {
  let query = `
    INSERT INTO contacto (tipo, dato, profesional)
    VALUES($1, $2, $3)
  `;
  let values = [ contacto.tipo, contacto.dato, contacto.profesional ];
  return client.query(query, values);
}

module.exports.addContacto = addContacto;

module.exports.add = function(contacto) {
  return addContacto(pool, contacto);
}

module.exports.getAll = function(id) {
  let query = 'SELECT * FROM contacto WHERE profesional=$1';
  let values = [ id ];
  return pool.query(query, values);
}
