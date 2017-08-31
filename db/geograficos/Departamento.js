const { Pool } = require('pg')
const config = require('../../config');
const utils = require('../utils');
const pool = new Pool(config.db);

module.exports.getAll = function(query) {
  let sql_where = "";
  let values = [];
  let sql = 'SELECT * FROM departamento';
  if (query.provincia) {
    sql_where += utils.appendWhere(sql_where, "provincia=$1");
    values.push(query.provincia);
  }
  sql += sql_where;

  return new Promise(function(resolve, reject) {
    pool.query(sql, values)
    .then(r => {
      resolve(r.rows);
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let sql = 'SELECT * FROM departamento WHERE id=$1';
    let values = [ id ];
    pool.query(sql, values)
    .then(r => {
      resolve(r.rows[0]);
    })
    .catch(e => reject(e));
  });
}
