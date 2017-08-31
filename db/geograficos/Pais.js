const { Pool } = require('pg')
const config = require('../../config');
const pool = new Pool(config.db);

module.exports.getAll = function() {
  return new Promise(function(resolve, reject) {
    pool.query('SELECT * FROM pais')
    .then(r => {
      resolve(r.rows);
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let query = 'SELECT * FROM pais WHERE id=$1';
    let values = [ id ];
    pool.query(query, values)
    .then(r => {
      resolve(r.rows[0]);
    })
    .catch(e => reject(e));
  });
}
