const connector = require('../../db/connector');
const utils = require('../../utils');
const sql = require('sql');
sql.setDialect('postgres');
const Pais = require('./Pais');

const table = sql.define({
  name: 'provincia',
  columns: [
    {
      name: 'id',
      dataType: 'serial',
      primaryKey: true
    },
    {
      name: 'nombre',
      dataType: 'varchar(100)',
      notNull: true
    },
    {
      name: 'pais',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: {
      table: 'pais',
      columns: [ 'pais' ],
      refColumns: [ 'id' ]
  }
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.id, table.nombre)
  .from(table.join(Pais.table).on(table.pais.equals(Pais.table.id)));

  if (params.pais_id && !isNaN(+params.pais_id)) query.where(table.pais.equals(+params.pais_id));
  if (params.pais_text) query.where(Pais.table.nombre.equals(params.pais_text));

  return new Promise(function(resolve, reject) {
    connector.execQuery(query.toQuery())
    .then(r => {
      resolve(r.rows);
    })
    .catch(e => reject(e));
  });
}

module.exports.get = function(id) {
  return new Promise(function(resolve, reject) {
    let query = table.select(table.star()).from(table).toQuery();
    connector.execQuery(query)
    .then(r => {
      resolve(r.rows[0]);
    })
    .catch(e => reject(e));
  });
}
