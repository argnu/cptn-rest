const connector = require('../../db/connector');
const utils = require('../../utils');
const sql = require('node-sql-2');
sql.setDialect('postgres');
const Provincia = require('./Provincia');

const table = sql.define({
  name: 'departamento',
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
      name: 'provincia',
      dataType: 'int',
      notNull: true
    }
  ],

  foreignKeys: {
      table: 'provincia',
      columns: [ 'provincia' ],
      refColumns: [ 'id' ]
  }
});

module.exports.table = table;

module.exports.getAll = function(params) {
  let query = table.select(table.id, table.nombre)
  .from(table.join(Provincia.table).on(table.provincia.equals(Provincia.table.id)));

  if (params.provincia_id && !isNaN(+params.provincia_id)) query.where(table.provincia.equals(+params.provincia_id));
  if (params.provincia_text) query.where(Provincia.table.nombre.equals(params.provincia_text));

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
