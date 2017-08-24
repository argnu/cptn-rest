const { Pool } = require('pg')
const config = require('../config');
const pool = new Pool(config.db);
const _ = require('lodash');

module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    let opciones = [];
    pool.query('SELECT * FROM opcion')
    .then(r => {
      opciones = _.groupBy(r.rows, (e) => e.tipo);
      resolve(opciones);
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let query = 'SELECT * FROM opcion WHERE id=$1';
    let values = [ id ];
    pool.query(query, values)
    .then(r => {
      resolve(r.rows[0]);
    })
    .catch(e => reject(e));
  });
}
